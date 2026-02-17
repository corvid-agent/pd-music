export interface Artist {
  id: string;
  name: string;
  sortName: string;
  type: string;
  country: string | null;
  disambiguation: string;
  beginDate: string | null;
  endDate: string | null;
}
