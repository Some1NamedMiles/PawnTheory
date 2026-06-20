const container = document.getElementById("openingsContainer");
const searchBar = document.getElementById("searchBar");

function displayOpenings(list) {
  container.innerHTML = "";

  list.forEach(opening => {
    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
      <h3>${opening.name}</h3>
      <p>${opening.description}</p>
    `;

    container.appendChild(card);
  });
}

displayOpenings(openings);

searchBar.addEventListener("input", () => {
  const search = searchBar.value.toLowerCase();

  const filtered = openings.filter(opening =>
    opening.name.toLowerCase().includes(search)
  );

  displayOpenings(filtered);
});
