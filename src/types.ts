export interface Specialty {
  id: string;
  name: string;
}

export interface MaskField {
  id: string;
  label: string;
  type?: 'number' | 'measurement3d' | 'select' | 'text' | 'textarea';
  unit?: string;
  options?: string[];
}

export interface Mask {
  id: string;
  name: string;
  specialtyId: string;
  baseContent: string;
  fields: MaskField[];
}

export interface Phrase {
  id: string;
  maskId: string;
  text: string;
  title?: string;
  category?: string;
}
