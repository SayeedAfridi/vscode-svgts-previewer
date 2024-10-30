import * as vscode from "vscode";

const log = vscode.window.createOutputChannel("asset");

export function isSvgUri(uri: vscode.Uri) {
  return uri.path.endsWith(".svg");
}
export function isSvgr(uri: vscode.Uri) {
  return (
    uri.path.endsWith(".ts") ||
    uri.path.endsWith(".tsx") ||
    uri.path.endsWith(".js") ||
    uri.path.endsWith(".jsx")
  );
}

export function logMsg(msg: string) {
  log.appendLine(msg);
}

const svgExtRegex = /<SVGExt[^>]*>([\s\S]*?)<\/SVGExt>/i;

function hasSVGExport(content: string): boolean {
  const svgExportRegex = /<SVGExt[^>]*>[\s\S]*<\/SVGExt>/gim;
  return svgExportRegex.test(content);
}

export function convertSvgToLowerCase(svgString: string) {
  return svgString.replace(/<([A-Za-z][A-Za-z0-9]*)/g, (match, p1) => {
    return `<${p1.toLowerCase()}`;
  });
}
export function convertEndSvgToLowerCase(svgString: string) {
  return svgString.replace(/<\/([A-Za-z][A-Za-z0-9]*)/g, (match, p1) => {
    return `</${p1.toLowerCase()}`;
  });
}

export function modifiedSVG(svgString: string) {
  let mod =  svgString.replace(
    /\b(?:fill|stroke|stop-color|color|text-fill-color|text-stroke)\s*=\s*{([^}]+)}/g,
    (match, p1) => {
      return match.replace(p1, "'#000'").replace(/{|}/g, "");
    }
  );
  mod = mod.replace('{height}', "'24px'");
  mod = mod.replace('{width}', "'24px'");
  return mod;
}

export function removeCurlyBracesIfNumber(svgString: string): string {
  // Regular expression to match numbers inside curly braces
  return svgString.replace(/{(\d+(\.\d+)?)}|{(\d+)}/g, (match, p1, p2, p3) => {
    // Replace the match with the number (without curly braces)
    return `'${p1}px'` || p3 || match;
  });
}

export function getOnlySvgString(data: string): string | undefined {
  if (hasSVGExport(data)) {
    const svgContentMatch = data.match(svgExtRegex);

    if (svgContentMatch) {
      let svgContent = (svgContentMatch[0] as any).replaceAll("SVGExt", "svg");
      let lowerCaseSvg = convertSvgToLowerCase(svgContent);
      lowerCaseSvg = convertEndSvgToLowerCase(lowerCaseSvg);
      let svg = removeCurlyBracesIfNumber(modifiedSVG(lowerCaseSvg));
      svg = svg.replace('{...props}', '');
      svg = svg.replace('{...rest}', '');
      if(!svg.includes("xmlns='http://www.w3.org/2000/svg'") && !svg.includes('xmlns="http://www.w3.org/2000/svg"') ) {
        svg = svg.replace('svg', "svg xmlns='http://www.w3.org/2000/svg'")
      }
      return svg
    } else {
      vscode.window.showErrorMessage("No SVGs found");
    }
  } else {
    vscode.window.showInformationMessage("The file does not contain an SVG.");
  }
}
