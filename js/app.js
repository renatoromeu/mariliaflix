/**
 * app.js (com logging de erros nas imagens)
 */

document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("main-content");
  const modal       = document.getElementById("modal");
  const modalClose  = document.getElementById("modalClose");
  const modalMediaContainer = document.getElementById("modalMediaContainer");
  const modalTitle  = document.getElementById("modalTitle");
  const modalLikes  = document.getElementById("modalLikes");
  const likeButton  = document.getElementById("likeButton");

  let itemAtual = null;

  // Função auxiliar para criar elemento com classes e atributos
  function criaElemento(tag, classes = [], atributos = {}) {
    const el = document.createElement(tag);
    classes.forEach((cls) => el.classList.add(cls));
    Object.keys(atributos).forEach((attr) => el.setAttribute(attr, atributos[attr]));
    return el;
  }

  // 1) Buscando JSONs
  Promise.all([
    fetch("data/videos.json")
      .then((res) => {
        if (!res.ok) throw new Error("Não foi possível carregar data/videos.json");
        return res.json();
      }),
    fetch("data/photos.json")
      .then((res) => {
        if (!res.ok) throw new Error("Não foi possível carregar data/photos.json");
        return res.json();
      }),
  ])
    .then(([videos, fotos]) => {
      console.log("=== JSON de Vídeos carregado ===", videos);
      console.log("=== JSON de Fotos carregado ===", fotos);

      // 1.1) Ordena vídeos do mais recente para o mais antigo
      videos.sort((a, b) => {
        const [da, ma, ya] = a.timestamp.split("/").map(Number);
        const [db, mb, yb] = b.timestamp.split("/").map(Number);
        const dateA = ya * 10000 + ma * 100 + da;
        const dateB = yb * 10000 + mb * 100 + db;
        return dateB - dateA;
      });

      // 1.2) Ordena fotos do mais recente para o mais antigo
      fotos.sort((a, b) => {
        const [da, ma, ya] = a.timestamp.split("/").map(Number);
        const [db, mb, yb] = b.timestamp.split("/").map(Number);
        const dateA = ya * 10000 + ma * 100 + da;
        const dateB = yb * 10000 + mb * 100 + db;
        return dateB - dateA;
      });

      // 1.3) Agrupa fotos por “Momento Mês de Ano”
      const agrupadoPorMesAno = fotos.reduce((acc, foto) => {
        const [dia, mes, ano] = foto.timestamp.split("/").map(Number);
        const nomesMes = [
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro",
        ];
        const nomeMes = nomesMes[mes - 1];
        const chave = `Momento ${nomeMes} de ${ano}`;
        if (!acc[chave]) acc[chave] = [];
        acc[chave].push(foto);
        return acc;
      }, {});

      console.log("=== Fotos agrupadas por mês/ano ===", agrupadoPorMesAno);

      // 2) Cria a seção “Vídeos”
      criaSecaoVideos(videos);

      // 3) Cria as seções de fotos
      criaSecoesFotos(agrupadoPorMesAno);
    })
    .catch((err) => {
      console.error("Erro ao carregar vídeos/fotos:", err);
      const erroMsg = criaElemento("p", [], {});
      erroMsg.textContent = "Erro ao carregar conteúdo. Veja o console para detalhes.";
      mainContent.appendChild(erroMsg);
    });

  // ======== Função para criar seção de vídeos ========
  function criaSecaoVideos(videos) {
    const titulo = criaElemento("h2", ["secao-titulo"]);
    titulo.textContent = "Vídeos";
    mainContent.appendChild(titulo);

    const row = criaElemento("div", ["row"]);
    mainContent.appendChild(row);

    videos.forEach((videoObj) => {
      const card = criaElemento("div", ["card"]);

      // Miniatura do vídeo
      const videoThumb = criaElemento("video", [], {
        src: `videos/${videoObj.filename}`,
        muted: "",
        preload: "metadata",
        playsinline: "",
      });
      videoThumb.addEventListener("click", (e) => {
        e.stopPropagation();
        abreModalVideo(videoObj);
      });
      // Se quiser logar erro de vídeo (caso 404), descomente abaixo:
      // videoThumb.onerror = () => console.error("Erro ao carregar vídeo:", videoThumb.src);

      card.appendChild(videoThumb);

      const likesDiv = criaElemento("div", ["card-likes"]);
      likesDiv.innerHTML = `<span class="icon-heart">❤</span><span>${videoObj.likes}</span>`;
      card.appendChild(likesDiv);

      row.appendChild(card);
    });
  }

  // ======== Função para criar seções de fotos ========
  function criaSecoesFotos(agrupadoPorMesAno) {
    Object.keys(agrupadoPorMesAno).forEach((secaoNome) => {
      const titulo = criaElemento("h2", ["secao-titulo"]);
      titulo.textContent = secaoNome;
      mainContent.appendChild(titulo);

      const row = criaElemento("div", ["row"]);
      mainContent.appendChild(row);

      agrupadoPorMesAno[secaoNome].forEach((fotoObj) => {
        const card = criaElemento("div", ["card"]);

        // Miniatura <img>
        const imgEl = criaElemento("img", [], {
          src: `img/${fotoObj.filename}`,
          alt: `Foto ${fotoObj.filename}`,
        });
        imgEl.addEventListener("click", (e) => {
          e.stopPropagation();
          abreModalFoto(fotoObj);
        });

        // LOG de erro se a imagem não for encontrada
        imgEl.onerror = () => {
          console.error("Erro ao carregar imagem:", imgEl.src);
        };

        card.appendChild(imgEl);

        // Overlay apenas com a data
        const overlay = criaElemento("div", ["card-overlay"]);
        overlay.innerHTML = `<div class="card-title">${fotoObj.timestamp}</div>`;
        card.appendChild(overlay);

        // Contador de likes
        const likesDiv = criaElemento("div", ["card-likes"]);
        likesDiv.innerHTML = `<span class="icon-heart">❤</span><span>${fotoObj.likes}</span>`;
        card.appendChild(likesDiv);

        row.appendChild(card);
      });
    });
  }

  // ======== Modal: abre vídeo ========
  function abreModalVideo(videoObj) {
    modalMediaContainer.innerHTML = "";
    const vid = criaElemento("video", [], {
      src: `videos/${videoObj.filename}`,
      controls: "",
      autoplay: "",
      muted: "",
      playsinline: "",
    });
    modalMediaContainer.appendChild(vid);

    modalTitle.textContent = `Vídeo: ${videoObj.timestamp}`;
    modalLikes.textContent = videoObj.likes;

    itemAtual = { tipo: "video", obj: videoObj };
    modal.classList.add("active");
  }

  // ======== Modal: abre foto ========
  function abreModalFoto(fotoObj) {
    modalMediaContainer.innerHTML = "";
    const imgEl = criaElemento("img", [], {
      src: `img/${fotoObj.filename}`,
      alt: `Foto ${fotoObj.filename}`,
    });
    modalMediaContainer.appendChild(imgEl);

    modalTitle.textContent = fotoObj.timestamp;
    modalLikes.textContent = fotoObj.likes;

    itemAtual = { tipo: "foto", obj: fotoObj };
    modal.classList.add("active");
  }

  // ======== Fecha modal ========
  function fecharModal() {
    const vid = modalMediaContainer.querySelector("video");
    if (vid) {
      vid.pause();
      vid.currentTime = 0;
    }
    modal.classList.remove("active");
    itemAtual = null;
  }

  // ======== Botão de “Curtir” ========
  likeButton.addEventListener("click", () => {
    if (!itemAtual) return;
    itemAtual.obj.likes++;
    modalLikes.textContent = itemAtual.obj.likes;

    document.querySelectorAll(".card").forEach((card) => {
      if (itemAtual.tipo === "foto") {
        const img = card.querySelector("img");
        if (img && img.getAttribute("src") === `img/${itemAtual.obj.filename}`) {
          const spanLikesNoCard = card.querySelector(".card-likes span:nth-child(2)");
          if (spanLikesNoCard) spanLikesNoCard.textContent = itemAtual.obj.likes;
        }
      } else if (itemAtual.tipo === "video") {
        const vid = card.querySelector("video");
        if (vid && vid.getAttribute("src") === `videos/${itemAtual.obj.filename}`) {
          const spanLikesNoCard = card.querySelector(".card-likes span:nth-child(2)");
          if (spanLikesNoCard) spanLikesNoCard.textContent = itemAtual.obj.likes;
        }
      }
    });
  });

  // ======== Eventos de fechamento do modal ========
  modalClose.addEventListener("click", fecharModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });
});
