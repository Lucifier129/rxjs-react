const toPromise = source =>
  new Promise((resolve, reject) => {
    let valueList = []
    let subscription = source.subscribe({
      next: value => valueList.push(value),
      complete: () => {
        resolve(valueList)
        subscription.unsubscribe()
      },
      error: error => {
        reject(error)
        subscription.unsubscribe()
      }
    })
  })

export default toPromise
