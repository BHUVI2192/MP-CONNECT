import { useEffect, useMemo, useState } from 'react';

type LgdRecord = Record<string, any>;

const API_URL = 'https://ckandev.indiadataportal.com/api/action/datastore_search';

const RESOURCES = {
  states: '9ac39fa8-29b4-41e4-acdb-c81190a8c56f',
  districts: '19df978a-675e-4ff5-8015-d0e1de447319',
  subDistricts: '42cd589e-2dc4-4f9c-a245-f201cee357e7',
  villages: 'cb81a7a4-a3bc-4962-a1eb-838a1db5bfdb',
};

const cache = new Map<string, LgdRecord[]>();

const uniqSorted = (vals: string[]) =>
  Array.from(new Set(vals.map((v) => (v ?? '').trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' })
  );

async function fetchRecords(
  resourceId: string,
  filters: Record<string, string>,
  limit = 1000
): Promise<LgdRecord[]> {
  const key = `${resourceId}::${JSON.stringify(filters)}::${limit}`;
  if (cache.has(key)) return cache.get(key)!;

  const records: LgdRecord[] = [];
  let offset = 0;

  // Paginate until we exhaust records for the requested filter.
  for (let i = 0; i < 200; i += 1) {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        resource_id: resourceId,
        filters,
        limit,
        offset,
      }),
    });

    if (!resp.ok) {
      throw new Error(`LGD API request failed (${resp.status})`);
    }

    const json = await resp.json();
    const page: LgdRecord[] = json?.result?.records ?? [];
    records.push(...page);

    if (page.length < limit) break;
    offset += limit;
  }

  cache.set(key, records);
  return records;
}

export function useLgdLocations(
  stateName: string,
  districtName: string,
  subDistrictName: string,
  gpName: string
) {
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [taluks, setTaluks] = useState<string[]>([]);
  const [villagesRows, setVillagesRows] = useState<LgdRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchRecords(RESOURCES.states, {}, 100)
      .then((rows) => {
        if (!cancelled) {
          setStates(
            uniqSorted(
              rows.map(
                (r) => r.state_name ?? r.state_ut ?? r.state ?? r.name ?? ''
              )
            )
          );
        }
      })
      .catch(() => {
        if (!cancelled) setStates([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!stateName) {
      setDistricts([]);
      return;
    }

    setLoading(true);
    fetchRecords(RESOURCES.districts, { state_name: stateName }, 1000)
      .then((rows) => {
        if (!cancelled) {
          setDistricts(uniqSorted(rows.map((r) => r.district_name)));
        }
      })
      .catch(() => {
        if (!cancelled) setDistricts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stateName]);

  useEffect(() => {
    let cancelled = false;
    if (!stateName || !districtName) {
      setTaluks([]);
      return;
    }

    setLoading(true);
    fetchRecords(
      RESOURCES.subDistricts,
      { state_name: stateName, district_name: districtName },
      1000
    )
      .then((rows) => {
        if (!cancelled) {
          setTaluks(uniqSorted(rows.map((r) => r.sub_district_name)));
        }
      })
      .catch(() => {
        if (!cancelled) setTaluks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stateName, districtName]);

  useEffect(() => {
    let cancelled = false;
    if (!stateName || !districtName || !subDistrictName) {
      setVillagesRows([]);
      return;
    }

    setLoading(true);
    fetchRecords(
      RESOURCES.villages,
      {
        state_name: stateName,
        district_name: districtName,
        sub_district_name: subDistrictName,
      },
      1000
    )
      .then((rows) => {
        if (!cancelled) setVillagesRows(rows);
      })
      .catch(() => {
        if (!cancelled) setVillagesRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stateName, districtName, subDistrictName]);

  const gps = useMemo(
    () => uniqSorted(villagesRows.map((r) => r.local_body_name)),
    [villagesRows]
  );

  const villages = useMemo(() => {
    const rows = gpName
      ? villagesRows.filter((r) => (r.local_body_name ?? '').trim() === gpName)
      : villagesRows;
    return uniqSorted(rows.map((r) => r.village_name));
  }, [gpName, villagesRows]);

  return {
    states,
    districts,
    taluks,
    gps,
    villages,
    loading,
  };
}
