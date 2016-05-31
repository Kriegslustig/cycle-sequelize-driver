export const validate = {
  isCollection (state, collection, observer) {
    const model = state.get(collection)
    if (!model) {
      observer.onError(new Error(`Collection has not been defined yet: ${collection}`))
      observer.onCompleted()
      return false
    }
    return true
  }
}

