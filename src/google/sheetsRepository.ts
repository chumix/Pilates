import { APP_INFO } from "../appInfo";

const DRIVE = "https://www.googleapis.com/drive/v3";
const SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";

const TABS = [
  "Config",
  "Students",
  "Exercises",
  "Templates",
  "Slots",
  "Attendance",
  "Feedback",
  "Rooms",
  "Inventory",
] as const;

// Para peticiones GET: no añadir Content-Type.
const auth = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// Para peticiones que envían JSON: POST y PATCH.
const jsonAuth = (token: string) => ({
  ...auth(token),
  "Content-Type": "application/json",
});

async function ok(response: Response) {
  if (!response.ok) {
    throw new Error((await response.text()) || `Google API ${response.status}`);
  }
  return response.json();
}

export class SheetsRepository {
  constructor(
    private token: string,
    public spreadsheetId = "",
  ) {}

  async init() {
    const query = encodeURIComponent(
      "trashed = false and appProperties has { key='appId' and value='pilates-angela' }",
    );

    const found = await ok(
      await fetch(
        `${DRIVE}/files?q=${query}&fields=files(id,name)&spaces=drive`,
        { headers: auth(this.token) },
      ),
    );

    if (found.files?.[0]) {
      this.spreadsheetId = found.files[0].id;

      if (found.files[0].name !== APP_INFO.dataFileName) {
        await this.renameFile(APP_INFO.dataFileName);
      }
    } else {
      const file = await ok(
        await fetch(`${DRIVE}/files?fields=id`, {
          method: "POST",
          headers: jsonAuth(this.token),
          body: JSON.stringify({
            name: APP_INFO.dataFileName,
            mimeType: "application/vnd.google-apps.spreadsheet",
            appProperties: {
              appId: "pilates-angela",
              schemaVersion: "1",
            },
          }),
        }),
      );

      this.spreadsheetId = file.id;
      await this.ensureTabs();
    }

    return this.spreadsheetId;
  }

  async renameFile(name: string) {
    await ok(
      await fetch(`${DRIVE}/files/${this.spreadsheetId}`, {
        method: "PATCH",
        headers: jsonAuth(this.token),
        body: JSON.stringify({ name }),
      }),
    );
  }

  async archiveCurrentAndCreate() {
    if (this.spreadsheetId) {
      const stamp = new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(new Date())
        .replace(/[\/:,]/g, "-")
        .replace(/\s+/g, "_");

      await ok(
        await fetch(`${DRIVE}/files/${this.spreadsheetId}`, {
          method: "PATCH",
          headers: jsonAuth(this.token),
          body: JSON.stringify({
            name: `Pilario - Copia antes de restablecer - ${stamp}`,
            appProperties: {
              appId: "pilario-archive",
              schemaVersion: "3",
              archivedAt: new Date().toISOString(),
            },
          }),
        }),
      );
    }

    const file = await ok(
      await fetch(`${DRIVE}/files?fields=id`, {
        method: "POST",
        headers: jsonAuth(this.token),
        body: JSON.stringify({
          name: APP_INFO.dataFileName,
          mimeType: "application/vnd.google-apps.spreadsheet",
          appProperties: {
            appId: "pilates-angela",
            schemaVersion: "3",
          },
        }),
      }),
    );

    this.spreadsheetId = file.id;
    await this.ensureTabs();
    return this.spreadsheetId;
  }

  get sheetUrl() {
    return this.spreadsheetId
      ? `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`
      : "";
  }

  private async ensureTabs() {
    const metadata = await ok(
      await fetch(
        `${SHEETS}/${this.spreadsheetId}?fields=sheets.properties`,
        { headers: auth(this.token) },
      ),
    );

    const existing = new Set(
      metadata.sheets.map((sheet: any) => sheet.properties.title),
    );

    const requests = TABS.filter((title) => !existing.has(title)).map(
      (title) => ({ addSheet: { properties: { title } } }),
    );

    if (requests.length) {
      await ok(
        await fetch(`${SHEETS}/${this.spreadsheetId}:batchUpdate`, {
          method: "POST",
          headers: jsonAuth(this.token),
          body: JSON.stringify({ requests }),
        }),
      );
    }
  }

  private rows(db: any) {
    return {
      Config: [
        ["key", "value"],
        ["schemaVersion", "1"],
        ["updatedAt", new Date().toISOString()],
        ["settings", JSON.stringify(db.settings || {})],
      ],
      Students: [
        ["id", "json"],
        ...(db.students || []).map((item: any) => [
          item.id,
          JSON.stringify(item),
        ]),
      ],
      Exercises: [
        ["id", "json"],
        ...(db.exercises || []).map((item: any) => [
          item.id,
          JSON.stringify(item),
        ]),
      ],
      Templates: [
        ["id", "json"],
        ...(db.templates || []).map((item: any) => [
          item.id,
          JSON.stringify(item),
        ]),
      ],
      Slots: [
        ["id", "json"],
        ...(db.slots || []).map((item: any) => [
          item.id,
          JSON.stringify(item),
        ]),
      ],
      Attendance: [
        ["key", "json"],
        ...Object.entries(db.attendance || {}).map(([key, value]) => [
          key,
          JSON.stringify(value),
        ]),
      ],
      Feedback: [
        ["key", "json"],
        ...Object.entries(db.feedback || {}).map(([key, value]) => [
          key,
          JSON.stringify(value),
        ]),
      ],
      Rooms: [
        ["id", "json"],
        ...(db.rooms || []).map((item: any) => [
          item.id,
          JSON.stringify(item),
        ]),
      ],
      Inventory: [
        ["id", "json"],
        ...(db.inventory || []).map((item: any) => [
          item.id,
          JSON.stringify(item),
        ]),
      ],
    };
  }

  async save(db: any) {
    await this.ensureTabs();

    const rows = this.rows(db);
    const data = Object.entries(rows).map(([range, values]) => ({
      range: `${range}!A1`,
      majorDimension: "ROWS",
      values,
    }));

    await ok(
      await fetch(`${SHEETS}/${this.spreadsheetId}/values:batchClear`, {
        method: "POST",
        headers: jsonAuth(this.token),
        body: JSON.stringify({ ranges: TABS.map((tab) => `${tab}!A:Z`) }),
      }),
    );

    await ok(
      await fetch(`${SHEETS}/${this.spreadsheetId}/values:batchUpdate`, {
        method: "POST",
        headers: jsonAuth(this.token),
        body: JSON.stringify({ valueInputOption: "RAW", data }),
      }),
    );
  }

  async load() {
    await this.ensureTabs();

    const params = new URLSearchParams();
    for (const tab of TABS) {
      params.append("ranges", `${tab}!A:B`);
    }

    const data = await ok(
      await fetch(
        `${SHEETS}/${this.spreadsheetId}/values:batchGet?${params}`,
        { headers: auth(this.token) },
      ),
    );

    const map = Object.fromEntries(
      data.valueRanges.map((item: any, index: number) => [
        TABS[index],
        item.values || [],
      ]),
    );

    const parse = (name: string) =>
      (map[name] || [])
        .slice(1)
        .map((row: string[]) => {
          try {
            return JSON.parse(row[1]);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

    const settingsRow = (map.Config || []).find(
      (row: string[]) => row[0] === "settings",
    );

    const feedback = Object.fromEntries(
      (map.Feedback || []).slice(1).map((row: string[]) => {
        try {
          return [row[0], JSON.parse(row[1])];
        } catch {
          return [row[0], {}];
        }
      }),
    );

    const attendance = Object.fromEntries(
      (map.Attendance || []).slice(1).map((row: string[]) => {
        try {
          return [row[0], JSON.parse(row[1])];
        } catch {
          return [row[0], []];
        }
      }),
    );

    const students = parse("Students");
    if (!students.length) return null;

    return {
      v: 1,
      students,
      exercises: parse("Exercises"),
      templates: parse("Templates"),
      slots: parse("Slots"),
      attendance,
      feedback,
      rooms: parse("Rooms"),
      inventory: parse("Inventory"),
      settings: settingsRow
        ? JSON.parse(settingsRow[1])
        : { url: "", status: "sync", lastSync: null },
    };
  }
}
