exports.handler = async (event) => {
  try {

    const token = process.env.GITHUB_TOKEN;

    const {
      menuData
    } = JSON.parse(event.body);

    const owner = "lekashmirsangatte";
    const repo = "kashmir";
    const file = "index.html";

    // lecture du fichier

    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${file}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );

    const meta = await fileRes.json();

    if (!meta.sha) {
      throw new Error("Impossible de lire index.html");
    }

    const sourceHtml = Buffer
      .from(meta.content.replace(/\n/g, ""), "base64")
      .toString("utf8");

    const updatedHtml = sourceHtml.replace(
      /(var MENU_DATA = )\[[\s\S]*?\](;[\s\n]*\/\* ={10,}\n   CONFIG)/,
      `$1${JSON.stringify(menuData, null, 2)}$2`
    );

    const encoded = Buffer
      .from(updatedHtml, "utf8")
      .toString("base64");

    const pushRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${file}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Mise à jour de la carte",
          content: encoded,
          sha: meta.sha
        })
      }
    );

    const result = await pushRes.json();

    if (!pushRes.ok) {
      throw new Error(result.message);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true
      })
    };

  } catch (err) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message
      })
    };

  }
};
