const storageSession = {
  getItem: (key: string) => {
    return Promise.resolve(window.sessionStorage.getItem(key))
  },
  setItem: (key: string, value: string) => {
    window.sessionStorage.setItem(key, value)
    return Promise.resolve()
  },
  removeItem: (key: string) => {
    window.sessionStorage.removeItem(key)
    return Promise.resolve()
  }
}

export default storageSession
