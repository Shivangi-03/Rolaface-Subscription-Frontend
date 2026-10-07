import { parsePhoneNumberWithError } from "libphonenumber-js";
import type {
  AddressValues,
  CustomerAddress,
  CustomerContact,
  CustomerDetail,
  CustomerFormValues,
  CustomerTab,
} from "../../types/customer.types";

export const CUSTOMER_TABS: { value: CustomerTab; label: string }[] = [
  { value: "details", label: "Details" },
  { value: "address", label: "Address" },
];

export const TAB_OF_FIELD = (field: string): CustomerTab =>
  field.startsWith("billing") || field.startsWith("shipping") ? "address" : "details";

export const emptyAddress = (): AddressValues => ({
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
});

export const defaultValues = (): CustomerFormValues => ({
  name: "",
  currency: "",
  mobileCode: "",
  mobileNumber: "",
  email: "",
  website: "",
  sameAsBilling: true,
  billing: emptyAddress(),
  shipping: emptyAddress(),
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidWebsite = (s: string) => {
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return /^[^.\s]+(\.[^.\s]+)+$/.test(u.hostname);
  } catch {
    return false;
  }
};

export const validateCustomer = (v: CustomerFormValues) => {
  const e: Record<string, string> = {};

  if (!v.name.trim()) e.name = "Customer name is required";
  if (!v.currency) e.currency = "Currency is required";

  if (!/^\+\d{1,4}$/.test(v.mobileCode.trim())) e.mobileCode = "Enter country code, e.g. +91";
  if (!/^\d{4,14}$/.test(v.mobileNumber.trim())) e.mobileNumber = "Enter a valid phone number";

  if (!v.email.trim()) e.email = "Email is required";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Invalid email format";

  if (!v.website.trim()) e.website = "Website is required";
else if (!isValidWebsite(v.website.trim())) e.website = "Enter a valid website, e.g. https://example.com";

  const checkAddress = (key: "billing" | "shipping", a: AddressValues) => {
    if (!a.line1.trim()) e[`${key}.line1`] = "Address line 1 is required";
    if (!a.city.trim()) e[`${key}.city`] = "City is required";
    if (!a.state.trim()) e[`${key}.state`] = "State is required";
    if (!a.country.trim()) e[`${key}.country`] = "Country is required";
  };
  checkAddress("billing", v.billing);
  if (!v.sameAsBilling) checkAddress("shipping", v.shipping);

  return e;
};

export const splitMobile = (mobile?: string): { code: string; number: string } => {
  const clean = (mobile ?? "").replace(/\s/g, "");
  if (!clean) return { code: "", number: "" };
  if (!clean.startsWith("+")) return { code: "", number: clean.replace(/\D/g, "") };
  try {
    const p = parsePhoneNumberWithError(clean);
    return { code: `+${p.countryCallingCode}`, number: p.nationalNumber };
  } catch {
    return { code: "", number: clean.replace(/\D/g, "") };
  }
};

export const sanitizeCode = (value: string) => {
  if (!value) return "";
  return `+${value.replace(/\D/g, "").slice(0, 4)}`;
};

export const sanitizeDigits = (value: string) => value.replace(/\D/g, "").slice(0, 14);

const fromApiAddress = (a?: CustomerAddress): AddressValues => ({
  line1: a?.line1 ?? "",
  line2: a?.line2 ?? "",
  city: a?.city ?? "",
  state: a?.state ?? "",
  postalCode: a?.postalCode ?? "",
  country: a?.country ?? "",
});

const isEmptyAddress = (a: AddressValues) => Object.values(a).every((x) => !x.trim());
const sameAddress = (a: AddressValues, b: AddressValues) =>
  (Object.keys(a) as (keyof AddressValues)[]).every((k) => a[k] === b[k]);

export const mapDetailToForm = (d: CustomerDetail): CustomerFormValues => {
  const contacts = d.contacts ?? [];
  const contact = contacts.find((c) => c.isPrimary) ?? contacts[0];
  const mob = splitMobile(contact?.mobile ?? d.mobile);

  const addresses = d.addresses ?? [];
  const billing =
    addresses.length > 0
      ? fromApiAddress(addresses.find((a) => a.type === "Billing"))
      : {
          line1: d.billingAddressLine1 ?? "",
          line2: d.billingAddressLine2 ?? "",
          city: d.billingCity ?? "",
          state: d.billingState ?? "",
          postalCode: d.billingPostalCode ?? "",
          country: d.billingCountry ?? "",
        };
  const shipping =
    addresses.length > 0
      ? fromApiAddress(addresses.find((a) => a.type === "Shipping"))
      : {
          line1: d.shippingAddressLine1 ?? "",
          line2: d.shippingAddressLine2 ?? "",
          city: d.shippingCity ?? "",
          state: d.shippingState ?? "",
          postalCode: d.shippingPostalCode ?? "",
          country: d.shippingCountry ?? "",
        };

  return {
    name: d.name ?? "",
    currency: d.currency ?? "",
    mobileCode: mob.code,
    mobileNumber: mob.number,
    email: contact?.email ?? d.email ?? "",
    sameAsBilling: isEmptyAddress(shipping) || sameAddress(billing, shipping),
    website: d.website ?? "",
    billing,
    shipping,
  };
};

const mobileOf = (v: CustomerFormValues) => `${v.mobileCode.trim()}${v.mobileNumber.trim()}`;

const toApiAddress = (type: string, a: AddressValues, base?: CustomerAddress, isPrimary = false) => ({
  ...(base?.id ? { id: base.id } : {}),
  type,
  line1: a.line1.trim(),
  line2: a.line2.trim(),
  city: a.city.trim(),
  state: a.state.trim(),
  postalCode: a.postalCode.trim(),
  country: a.country.trim(),
  isPrimary: base?.isPrimary ?? isPrimary,
});

const keepAddress = (a: CustomerAddress) => ({
  ...(a.id ? { id: a.id } : {}),
  type: a.type ?? "Billing",
  line1: a.line1 ?? "",
  line2: a.line2 ?? "",
  city: a.city ?? "",
  state: a.state ?? "",
  postalCode: a.postalCode ?? "",
  country: a.country ?? "",
  isPrimary: !!a.isPrimary,
});

const keepContact = (c: CustomerContact) => ({
  ...(c.id ? { id: c.id } : {}),
  firstName: c.firstName ?? "",
  email: c.email ?? "",
  mobile: c.mobile ?? "",
});

const newPrimaryContact = (v: CustomerFormValues) => ({
  firstName: v.name.trim(),
  email: v.email.trim(),
  mobile: mobileOf(v),
});

export const buildCreatePayload = (v: CustomerFormValues): Record<string, unknown> => ({
  name: v.name.trim(),
  displayName: v.name.trim(),
  currency: v.currency,
  contacts: [newPrimaryContact(v)],
  website: v.website.trim(),
  addresses: [
    toApiAddress("Billing", v.billing, undefined, true),
    toApiAddress("Shipping", v.sameAsBilling ? v.billing : v.shipping),
  ],
});


export const buildUpdatePayload = (v: CustomerFormValues, original: CustomerDetail): Record<string, unknown> => {
  const origContacts = original.contacts ?? [];
  let contacts: Record<string, unknown>[];
  if (origContacts.length === 0) {
    contacts = [newPrimaryContact(v)];
  } else {
    const primaryIdx = Math.max(
      origContacts.findIndex((c) => c.isPrimary),
      0,
    );
    contacts = origContacts.map((c, i) =>
      i === primaryIdx ? { ...keepContact(c), email: v.email.trim(), mobile: mobileOf(v) } : keepContact(c),
    );
  }

  const shippingSrc = v.sameAsBilling ? v.billing : v.shipping;
  let hasBilling = false;
  let hasShipping = false;
  const addresses: Record<string, unknown>[] = (original.addresses ?? []).map((a) => {
    if (a.type === "Billing" && !hasBilling) {
      hasBilling = true;
      return toApiAddress("Billing", v.billing, a, true);
    }
    if (a.type === "Shipping" && !hasShipping) {
      hasShipping = true;
      return toApiAddress("Shipping", shippingSrc, a);
    }
    return keepAddress(a);
  });
  if (!hasBilling) addresses.push(toApiAddress("Billing", v.billing, undefined, true));
  if (!hasShipping) addresses.push(toApiAddress("Shipping", shippingSrc));

  return {
    name: v.name.trim(),
    currency: v.currency,
    website: v.website.trim(),
    contacts,
    addresses,
  };
};