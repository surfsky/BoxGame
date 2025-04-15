/************************************************************
 * Messagebox result enum
 ***********************************************************/
export enum DialogResult {
    Ok = 1,
    Cancel = 0
}


/**
 * Dialog return data
 */
export interface DialogReturn{
    result: DialogResult;
    data: any;
}