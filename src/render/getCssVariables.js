export function getCssVarsUno() {
  return Array.from(document.styleSheets)
    .filter(
      (sheet) =>
        sheet.href === null || sheet.href.startsWith(window.location.origin)
    )
    .reduce(
      (acc, sheet) =>
        (acc = [
          ...acc,
          ...Array.from(sheet.cssRules).reduce(
            (def, rule) =>
              (def =
                rule.selectorText === ":root"
                  ? [
                      ...def,
                      ...Array.from(rule.style).filter((name) =>
                        name.startsWith("--")
                      ),
                    ]
                  : def),
            []
          ),
        ]),
      []
    );
}

function getAllCSSVariableNames(styleSheets = document.styleSheets) {
  var cssVars = [];
  // loop each stylesheet
  for (var i = 0; i < styleSheets.length; i++) {
    // loop stylesheet's cssRules
    try {
      // try/catch used because 'hasOwnProperty' doesn't work
      for (var j = 0; j < styleSheets[i].cssRules.length; j++) {
        try {
          // loop stylesheet's cssRules' style (property names)
          for (var k = 0; k < styleSheets[i].cssRules[j].style.length; k++) {
            let name = styleSheets[i].cssRules[j].style[k];
            // test name for css variable signiture and uniqueness
            if (name.startsWith("--") && cssVars.indexOf(name) == -1) {
              cssVars.push(name);
            }
          }
        } catch (error) {}
      }
    } catch (error) {}
  }
  return cssVars;
}

function getAllCssVariableValues(allCSSVars, element = document.body, pseudo) {
  // let pseudoClasses = [
  //   "active", "any-link", "blank", "checked", "current", "default", "defined",
  //   "dir", "disabled", "drop", "empty", "enabled", "first", "first-child",
  //   "first-of-type", "focus", "focus-visible", "focus-within", "fullscreen",
  //   "future", "has", "host", "host-context", "hover", "indeterminate", "in-range",
  //   "invalid", "is", "lang", "last-child", "last-of-type", "left", "link",
  //   "local-link", "not", "nth-child", "nth-col", "nth-last-child", "nth-last-col",
  //   "nth-last-of-type", "nth-of-type", "only-child", "only-of-type", "optional",
  //   "out-of-range", "past", "placeholder-shown", "read-only", "read-write",
  //   "required", "right", "root", "scope", "target", "target-within", "user-invalid",
  //   "valid", "visited", "where"
  // ];

  const pseudoClasses = [
    ":active",
    ":any-link",
    ":blank",
    ":checked",
    ":current",
    ":default",
    ":defined",
    ":dir",
    ":disabled",
    ":empty",
    ":enabled",
    ":first",
    ":first-child",
    ":first-of-type",
    ":focus",
    ":focus-visible",
    ":focus-within",
    ":fullscreen",
    ":future",
    ":has",
    ":host",
    ":host-context",
    ":hover",
    ":in-range",
    ":indeterminate",
    ":invalid",
    ":is",
    ":lang",
    ":last-child",
    ":last-of-type",
    ":left",
    ":link",
    ":local-link",
    ":not",
    ":nth-child",
    ":nth-col",
    ":nth-last-child",
    ":nth-last-col",
    ":nth-last-of-type",
    ":nth-of-type",
    ":only-child",
    ":only-of-type",
    ":optional",
    ":out-of-range",
    ":past",
    ":placeholder-shown",
    ":read-only",
    ":read-write",
    ":required",
    ":right",
    ":root",
    ":scope",
    ":state",
    ":target",
    ":target-within",
    ":user-invalid",
    ":valid",
    ":visited",
    ":where",
    "",
  ];

  var cssVars = {};
  for (let c = 0; c < pseudoClasses.length; c++) {
    let pseudo = pseudoClasses[c];
    var elStyles = window.getComputedStyle(element, pseudo);
    for (var i = 0; i < allCSSVars.length; i++) {
      let key = allCSSVars[i];
      let value = elStyles.getPropertyValue(key);
      if (value) {
        cssVars[key] = value;
      }
    }
  }

  // var elStyles = window.getComputedStyle(element, pseudo);
  // var cssVars = {};
  // for(var i = 0; i < allCSSVars.length; i++){
  //   let key = allCSSVars[i];
  //   let value = elStyles.getPropertyValue(key)
  //   if(value){cssVars[key] = value;}
  // }
  return cssVars;
}

export function getCssVars() {
  return getAllCssVariableValues(getAllCSSVariableNames());
}

export function getElementCSSVariables(
  allCSSVars,
  element = document.body,
  pseudo
) {
  var elStyles = window.getComputedStyle(element, pseudo);
  var cssVars = {};
  for (var i = 0; i < allCSSVars.length; i++) {
    let key = allCSSVars[i];
    let value = elStyles.getPropertyValue(key);
    if (value) {
      cssVars[key] = value;
    }
  }
  return cssVars;
}

// export function getCss
