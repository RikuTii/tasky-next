
export const formatDate = (date:string | undefined, locale: string = "") => {
    if(date) {
        let jsDate = new Date(date);
        return jsDate.toLocaleDateString() + " " + jsDate.toLocaleTimeString();
    }

    return "";
}

