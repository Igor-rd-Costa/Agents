type FieldKey = string;


type ComponentType = 'chart';

type ChartType = 'calendar';

type CalendarSchema = {
    timeField: FieldKey,
    rows: FieldKey[]
}

export type Component = {
    name: string,
    description: string,
    type: ComponentType,
    subType: ChartType
    dataSchema: CalendarSchema
}



const component: Component = {
    name: 'Calendar',
    description: '',
    type: 'chart',
    subType: 'calendar',
    dataSchema: {
        timeField: 'Data',
        rows: ['ValorTotal']
    }
}