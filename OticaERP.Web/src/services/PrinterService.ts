import api from './api';

export interface Printer {
    id: number;
    name: string;
    model: string;
    serialNumber: string;
    type: string;
    connectionPath: string;
    isActive: boolean;
}

export const getPrinters = async () => {
    return api.get<Printer[]>('/printers');
};

export const createPrinter = async (data: Omit<Printer, 'id'>) => {
    return api.post<Printer>('/printers', data);
};

export const deletePrinter = async (id: number) => {
    return api.delete(`/printers/${id}`);
};

export const testPrinter = async (id: number) => {
    return api.post(`/printers/${id}/test`);
};

export const printSale = async (saleId: number) => {
    return api.post(`/sales/${saleId}/print`);
};
