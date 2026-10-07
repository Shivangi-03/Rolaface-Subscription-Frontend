import {
  useEffect,
  useMemo,
  useState,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { getRolaCountryList, searchRolaCurrencies } from "../api/LookupApi";
import { isCanceled } from "../api/utils/ApiError";

export interface SelectOption {
  value: string;
  label: string;
}

interface State {
  options: SelectOption[];
  loading: boolean;
  error: boolean;
}

const byLabel = (a: SelectOption, b: SelectOption) => a.label.localeCompare(b.label);


const FSI = "\u2068";
const PDI = "\u2069";
const currencyLabel = (code: string, symbol?: string) =>
  symbol && symbol !== code ? `${code} (${FSI}${symbol}${PDI})` : code;

const currencyLabelCache = new Map<string, string>();

let initialCurrencies: Promise<SelectOption[]> | null = null; 

async function fetchCurrencies(query: string, signal?: AbortSignal): Promise<SelectOption[]> {
  const rows = await searchRolaCurrencies(query, signal);
  return rows
    .filter((c) => c?.name)
    .map((c) => {
      const label = currencyLabel(c.name, c.symbol);
      currencyLabelCache.set(c.name, label);
      return { value: c.name, label };
    });
}

function loadCurrencies(query: string, signal: AbortSignal): Promise<SelectOption[]> {
  if (query) return fetchCurrencies(query, signal);
  if (!initialCurrencies) {
    initialCurrencies = fetchCurrencies("").catch((err) => {
      initialCurrencies = null;
      throw err;
    });
  }
  return initialCurrencies;
}


export function useCurrencySelect(selected?: string | null) {
  const [search, setSearch] = useState("");
  const [debounced] = useDebouncedValue(search, 300);
  const [state, setState] = useState<State>({ options: [], loading: true, error: false });

  const selectedLabel = selected ? (currencyLabelCache.get(selected) ?? selected) : "";
  const trimmed = debounced.trim();
  const query = trimmed === selectedLabel ? "" : trimmed;

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: false }));

    loadCurrencies(query, controller.signal)
      .then((options) => {
        if (!controller.signal.aborted) setState({ options, loading: false, error: false });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isCanceled(err)) return;
        setState({ options: [], loading: false, error: true });
      });

    return () => controller.abort();
  }, [query]);

  const options = useMemo(
    () =>
      !query && selected && !state.options.some((o) => o.value === selected)
        ? [...state.options, { value: selected, label: currencyLabelCache.get(selected) ?? selected }]
        : state.options,
    [state.options, selected, query],
  );

  return { options, loading: state.loading, error: state.error, setSearch };
}


let countriesPromise: Promise<SelectOption[]> | null = null;

const loadCountries = () => {
  if (!countriesPromise) {
    countriesPromise = getRolaCountryList()
      .then((rows) =>
        rows
          .filter((c) => c?.name)
          .map((c) => ({ value: c.name, label: c.country_name || c.name }))
          .sort(byLabel),
      )
      .catch((err) => {
        countriesPromise = null;
        throw err;
      });
  }
  return countriesPromise;
};

export function useCountryOptions(selected?: string | null) {
  const [state, setState] = useState<State>({ options: [], loading: true, error: false });

  useEffect(() => {
    let alive = true;
    loadCountries()
      .then((options) => alive && setState({ options, loading: false, error: false }))
      .catch(() => alive && setState({ options: [], loading: false, error: true }));
    return () => {
      alive = false;
    };
  }, []);

  const options = useMemo(
    () =>
      selected && !state.options.some((o) => o.value === selected)
        ? [...state.options, { value: selected, label: selected }]
        : state.options,
    [state.options, selected],
  );

  return { options, loading: state.loading, error: state.error };
}


type FocusProps = { onFocus?: (e: ReactFocusEvent<HTMLInputElement>) => void };

export function withSelectOnFocus<P extends FocusProps>(props: P) {
  return {
    ...props,
    onFocus: (e: ReactFocusEvent<HTMLInputElement>) => {
      props.onFocus?.(e); 
      const el = e.currentTarget;
      setTimeout(() => el.select(), 0);
    },
    onMouseUp: (e: ReactMouseEvent<HTMLInputElement>) => e.preventDefault(),
  };
}