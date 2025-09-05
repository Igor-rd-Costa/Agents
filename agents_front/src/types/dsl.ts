type FieldKey = string;

type ComponentType = 'chart';

type ChartType = 'calendar';

export type Component = {
    name: string,
    description: string,
    type: ComponentType,
    subType: ChartType
    columns: FieldKey[],
    rows: FieldKey[]
}