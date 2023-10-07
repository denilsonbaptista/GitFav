import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExist = this.entries.find((entry) => entry.login === username)

      if (userExist) {
        throw new Error("Usuário já cadastrado")
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado")
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tboby = this.root.querySelector("table tbody")
    this.wrapper = this.root.querySelector(".wrapper")

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector(".search button")

    addButton.onclick = (event) => {
      event.preventDefault()

      const { value } = this.root.querySelector(".search input")
      this.add(value)

      this.root.querySelector(".search input").value = ""
    }
  }

  update() {
    this.removeAllTr()
    this.checkFavorites()

    this.entries.forEach((user) => {
      const row = this.createRow()

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`
      row.querySelector(".user img").alt = `Imagem de ${user.name}`
      row.querySelector(".user a").href = `https://github.com/${user.login}`
      row.querySelector(".user p").textContent = `${user.name}`
      row.querySelector(".user span").textContent = `${user.login}`
      row.querySelector(".repositories").textContent = `${user.public_repos}`
      row.querySelector(".followers").textContent = `${user.followers}`

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Term certeza que desaja deletar está linha?")

        if (isOk) {
          this.delete(user)
        }
      }

      this.tboby.append(row)
    })
  }

  createRow() {
    const tr = document.createElement("tr")

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/denilsonbaptista.png" alt="" />
        <a href="https://github.com/denilsonbaptista" target="_blank">
          <p>Denilson Baptista</p>
          <span>/denilsonbaptista</span>
        </a>
      </td>
      <td class="repositories">123</td>
      <td class="followers">1234</td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `

    return tr
  }

  checkFavorites() {
    const removeNoFavorites = this.root.querySelector(".no-favorites")
    const empty = this.entries.length <= 0

    if (empty) {
      this.createNoFavorites()
    } else if (removeNoFavorites) {
      removeNoFavorites.remove()
    }
  }

  createNoFavorites() {
    const noFavorites = document.createElement("div")

    noFavorites.classList.add("no-favorites")

    noFavorites.innerHTML = `
      <img src="./assets/Estrela.svg" alt="" />
      <p>Nenhum favorito ainda</p>
    `

    this.wrapper.append(noFavorites)
  }

  removeAllTr() {
    this.tboby.querySelectorAll("tr").forEach((tr) => {
      tr.remove()
    })
  }
}
