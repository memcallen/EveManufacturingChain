
export const getQueryString = (params: {[key:string]:any}) => {
    const q = Object.entries(params)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .reduce((acc, x) => ((acc && acc + "&") || "") + x, "");

    return q ? ("?" + q) : "";
};
