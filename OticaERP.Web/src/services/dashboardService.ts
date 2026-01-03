import api from './api';

export interface DashboardStats {
    dailySalesTotal: number;
    dailySalesPreviousYear: number;
    monthlySalesTotal: number;
    activeServiceOrdersCount: number;
}

export interface SalesHistory {
    period: string; // "MM/yyyy"
    totalValue: number;
}

export interface ActiveOrder {
    id: number;
    manualOrderNumber: number;
    clientName: string;
    productName: string;
    status: string;
    deliveryDate: string;
    remainingBalance: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getSalesHistory = async (): Promise<SalesHistory[]> => {
    const response = await api.get('/dashboard/sales-history');
    return response.data;
};

export const getActiveOrders = async (): Promise<ActiveOrder[]> => {
    const response = await api.get('/dashboard/active-orders');
    return response.data;
};
