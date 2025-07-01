export function createHashRouter(routes) {
    const getPath = () => location.hash.slice(1) || '/'
    let app = null

    function render(path) {
        if (routes[path]) {
            app.innerHTML = routes[path]()
        } else {
            app.innerHTML = `<h1>404 Not Found</h1>`
        }
    }

    return {
        start(selector) {
            app = document.querySelector(selector)
            window.addEventListener('hashchange', () => render(getPath()))
            render(getPath())
        },
        push(path) {
            location.hash = path
        }
    }
}

export function createHistoryRouter(routes) {
    const getPath = () => location.pathname || '/'
    let app = null

    function render(path) {
        if (routes[path]) {
            app.innerHTML = routes[path]()
        } else {
            app.innerHTML = `<h1>404 Not Found</h1>`
        }
    }

    return {
        start(selector) {
            app = document.querySelector(selector)

            window.addEventListener('popstate', () => render(getPath()))
            render(getPath())
        },
        push(path) {
            history.pushState(null, '', path)
            render(path)
        }
    }
}

