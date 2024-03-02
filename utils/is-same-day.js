const isSameDay = (date1, date2) => {
    const sameYear = date1.getFullYear() === date2.getFullYear();
    const sameMonth = date1.getMonth() === date2.getMonth();
    const sameDay = date1.getDate() === date2.getDate();
		
    return sameYear && sameMonth && sameDay;
}

export default isSameDay;