/**
 * Mapped und merged die echten Daten in ein X-Achsen-Template.
 *
 * @param {string[]} templateNames - Die Namen für die X-Achse (z.B. days, months, weekdays).
 * @param {any[]} realData - Die echten Daten aus Supabase.
 * @param {(input: any) => string} formatFn - Funktion, um das echte Datenfeld aufs X-Achsen-Label zu bringen.
 * @returns {any[]} - Das gemergte Array für das Chart.
 */
export function mergeTemplateWithData(templateNames: any, realData: any, formatFn: any) {
    return templateNames.map((name: any) => {
      const found = realData.find((d: { name: any; }) => formatFn(d.name) === name);
      return found
        ? { ...found, name }
        : { name, critical: 0, high: 0, medium: 0, low: 0 };
    });
  }
