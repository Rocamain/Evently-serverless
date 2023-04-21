module.exports = (date, time) => {
  if (date && time) {
    const [day, month, year] = date.split('-')

    let [hours, minutes] = time.split(':')
    if (minutes[0] === '0') {
      minutes = minutes[1]
    }
    const eventDate = [
      Number(year),
      Number(month - 1),
      Number(day),
      Number(hours),
      Number(minutes),
    ]

    const dateWithTime = new Date(...eventDate)

    return dateWithTime.toISOString()
  }
}
