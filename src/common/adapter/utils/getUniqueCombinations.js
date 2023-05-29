module.exports = (arr) => {
  const combinations = []

  const backtrack = (currentCombination, start) => {
    combinations.push(currentCombination)

    for (let i = start; i < arr.length; i++) {
      backtrack([...currentCombination, arr[i]], i + 1)
    }
  }

  backtrack([], 0)

  return combinations.sort(
    (combination, next) => next.length - combination.length,
  )
}
