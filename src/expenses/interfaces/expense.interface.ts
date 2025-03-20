export interface ExpenseQuery {
    user: string;
    category?: string;
    date?: {
        $gte?: Date;
        $lte?: Date;
    };
}
