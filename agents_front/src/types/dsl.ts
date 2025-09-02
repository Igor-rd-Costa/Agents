type ChartType = 'vertical bars' | 'horizontal bars'

type FieldKey = string;

type Chart = {
    name: string,
    description: string,
    type: ChartType
    mainColor: string,
    backgroundColor: string,
    columns: FieldKey[],
    rows: FieldKey[]
}