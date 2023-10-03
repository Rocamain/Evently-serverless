const stingFormatter = (str) => {
  if (!str) {
    return
  }
  return str.trim().toLowerCase()
}

module.exports = { stingFormatter }
