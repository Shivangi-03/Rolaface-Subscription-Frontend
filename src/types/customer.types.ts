import type { UseFormReturnType } from "@mantine/form";

export interface CustomerContact {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  designation?: string;
  department?: string;
  registration_no?: string;
  isPrimary?: boolean;
  isBilling?: boolean;
}

export interface CustomerAddress {
  id?: string;
  type?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
}

export interface CustomerSummary {
  id: string;
  name: string;
  displayName?: string;
  currency?: string;
  status?: string; 
  email?: string;
  mobile?: string;
  website?: string;
}

export interface CustomerDetail extends CustomerSummary {
  contacts?: CustomerContact[];
  addresses?: CustomerAddress[];
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingPostalCode?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingPostalCode?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
}

export type CustomerTab = "details" | "address";

export interface AddressValues {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerFormValues {
  name: string;
  currency: string;
  mobileCode: string; 
  mobileNumber: string; 
  email: string;
  sameAsBilling: boolean;
  billing: AddressValues;
  shipping: AddressValues;
  website: string;
}

export type CustomerForm = UseFormReturnType<CustomerFormValues>;