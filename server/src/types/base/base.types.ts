export interface BaseWhereClause {
    $eq?: any
    $ne?: any
    $gt?: any
    $gte?: any
    $lt?: any
    $lte?: any
    $in?: any[]
    $nin?: any[]
    $regex?: string
    $exists?: boolean
}