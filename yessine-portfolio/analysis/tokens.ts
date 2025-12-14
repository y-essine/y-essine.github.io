// Comprehensive Design Tokens
// Extracted from Framer HTML - Complete System

export const tokens = {
  // CSS Variables
  cssVariables: {
    token_e2b3e115_6772_4873_ba11_049b11b30d8f: "#919191",
    token_ac9cb30b_a01e_4275_be89_8cf1cbb70095: "#292929",
    token_c89ea9f4_1c08_4225_bee9_c2e710a47467: "#d0a58b",
    token_d0fdb86e_048a_4262_a382_354e31e865d4: "#42342b",
    token_d66f81c5_a6e4_413c_8a4c_f51d9696ac77: "#2e2e2e",
    token_92d8255a_feac_4aed_ab72_dbce294d5959: "#141417",
    token_ecc20de8_44f8_460d_8567_5b1e87c8db9d: "#19191a",
    token_0f1b60e9_1b81_4863_983f_db9afa130b6b: "#fff",
    token_94ac02ff_ae61_4de7_9da6_379b1276c077: "#000
    }

    @supports (z-index:calc(infinity)) {
      #__framer-badge-container {
        --infinity: infinity
      }
    }

    #__framer-badge-container {
      pointer-events: none",
    infinity, 2147480000));
      justify_content: "flex-end",
    framer_will_change_override: "none
    }

    @supports (background:-webkit-named-image(i)) and (not (grid-template-rows:subgrid)) {
      body {
        --framer-will-change-override: transform
      }
    }

    body {
      --framer-will-change-filter-override: none
    }

    @supports (background:-webkit-named-image(i)) and (not (position-area:top right)) {
      body {
        --framer-will-change-filter-override: filter
      }
    }

    [data-framer-component-type] {
      position: absolute
    }

    [data-framer-component-type=Text] {
      cursor: inherit
    }

    [data-framer-component-text-autosized] * {
      white-space: pre
    }

    [data-framer-component-type=Text]>* {
      text-align: var(--framer-text-alignment, start)
    }

    [data-framer-component-type=Text] span span,
    [data-framer-component-type=Text] p span,
    [data-framer-component-type=Text] h1 span,
    [data-framer-component-type=Text] h2 span,
    [data-framer-component-type=Text] h3 span,
    [data-framer-component-type=Text] h4 span,
    [data-framer-component-type=Text] h5 span,
    [data-framer-component-type=Text] h6 span {
      display: block
    }

    [data-framer-component-type=Text] span span span,
    [data-framer-component-type=Text] p span span,
    [data-framer-component-type=Text] h1 span span,
    [data-framer-component-type=Text] h2 span span,
    [data-framer-component-type=Text] h3 span span,
    [data-framer-component-type=Text] h4 span span,
    [data-framer-component-type=Text] h5 span span,
    [data-framer-component-type=Text] h6 span span {
      display: unset
    }

    [data-framer-component-type=Text] div div span,
    [data-framer-component-type=Text] a div span,
    [data-framer-component-type=Text] span span span,
    [data-framer-component-type=Text] p span span,
    [data-framer-component-type=Text] h1 span span,
    [data-framer-component-type=Text] h2 span span,
    [data-framer-component-type=Text] h3 span span,
    [data-framer-component-type=Text] h4 span span,
    [data-framer-component-type=Text] h5 span span,
    [data-framer-component-type=Text] h6 span span,
    [data-framer-component-type=Text] a {
      font-family: var(--font-family)",
    font_style);
      font_weight: "min(calc(var(--framer-font-weight-increase, 0) + var(--font-weight, 400)), 900)",
    text_color);
      letter_spacing: "var(--letter-spacing)",
    font_size);
      text_transform: "var(--text-transform)",
    text_decoration: "var(--framer-link-current-text-decoration-style, var(--framer-link-text-decoration-style, var(--framer-text-decoration-style, solid)))var(--framer-link-current-text-decoration, var(--framer-link-text-decoration, var(--framer-text-decoration, none)))var(--framer-link-current-text-decoration-color, var(--framer-link-text-decoration-color, var(--framer-text-decoration-color, currentcolor)))var(--framer-link-current-text-decoration-thickness, var(--framer-link-text-decoration-thickness, var(--framer-text-decoration-thickness, auto)))",
    text_decoration_skip_ink: "var(--framer-link-current-text-decoration-skip-ink, var(--framer-link-text-decoration-skip-ink, var(--framer-text-decoration-skip-ink)))",
    text_underline_offset: "var(--framer-link-current-text-decoration-offset, var(--framer-link-text-decoration-offset, var(--framer-text-decoration-offset)))
    }

    [data-framer-component-type=RichTextContainer] {
      outline: none",
    line_height);
      __font_family: "var(--framer-font-family)",
    font_style: "var(--framer-link-current-font-style, var(--framer-link-font-style, var(--framer-font-style)))",
    font_weight: "var(--framer-link-current-font-weight, var(--framer-link-font-weight, var(--framer-font-weight)))",
    text_color: "var(--framer-link-current-text-color, var(--framer-link-text-color, var(--framer-text-color)))",
    letter_spacing: "var(--framer-letter-spacing)",
    font_size: "var(--framer-link-current-font-size, var(--framer-link-font-size, var(--framer-font-size)))",
    text_transform: "var(--framer-link-current-text-transform, var(--framer-link-text-transform, var(--framer-text-transform)))",
    line_height: "var(--framer-line-height)
    }

    [data-framer-component-type=Text] a,
    [data-framer-component-type=Text] a div span,
    [data-framer-component-type=Text] a span span span,
    [data-framer-component-type=Text] a p span span,
    [data-framer-component-type=Text] a h1 span span,
    [data-framer-component-type=Text] a h2 span span,
    [data-framer-component-type=Text] a h3 span span,
    [data-framer-component-type=Text] a h4 span span,
    [data-framer-component-type=Text] a h5 span span,
    [data-framer-component-type=Text] a h6 span span {
      --font-family: var(--framer-link-font-family, var(--framer-font-family))",
    framer_blockquote_font_family, var(__framer_font_family, Inter, Inter Placeholder, sans_serif));
      font_style: "var(--framer-blockquote-font-style, var(--framer-font-style, normal))",
    framer_blockquote_font_weight, var(__framer_font_weight, 400));
      color: "var(--framer-blockquote-text-color, var(--framer-text-color, #000))",
    framer_blockquote_font_size, var(__framer_font_size, 16px))*var(__framer_font_size_scale, 1));
      letter_spacing: "var(--framer-blockquote-letter-spacing, var(--framer-letter-spacing, 0))",
    framer_blockquote_text_transform, var(__framer_text_transform, none));
      _webkit_text_decoration_line: "var(--framer-blockquote-text-decoration, var(--framer-text-decoration, initial))",
    framer_blockquote_text_decoration, var(__framer_text_decoration, initial));
      _webkit_text_decoration_style: "var(--framer-blockquote-text-decoration-style, var(--framer-text-decoration-style, initial))",
    framer_blockquote_text_decoration_style, var(__framer_text_decoration_style, initial));
      _webkit_text_decoration_color: "var(--framer-blockquote-text-decoration-color, var(--framer-text-decoration-color, initial))",
    framer_blockquote_text_decoration_color, var(__framer_text_decoration_color, initial));
      text_decoration_thickness: "var(--framer-blockquote-text-decoration-thickness, var(--framer-text-decoration-thickness, initial))",
    framer_blockquote_text_decoration_skip_ink, var(__framer_text_decoration_skip_ink, initial));
      text_underline_offset: "var(--framer-blockquote-text-decoration-offset, var(--framer-text-decoration-offset, initial))",
    framer_blockquote_line_height, var(__framer_line_height, 1.2em));
      text_align: "var(--framer-blockquote-text-alignment, var(--framer-text-alignment, start))",
    framer_text_stroke_width, initial);
      _webkit_text_stroke_color: "var(--framer-text-stroke-color, initial)",
    framer_font_open_type_features, initial);
      _webkit_font_feature_settings: "var(--framer-font-open-type-features, initial)",
    framer_font_open_type_features, initial);
      font_variation_settings: "var(--framer-font-variation-axes, normal)",
    framer_text_wrap_override, var(__framer_text_wrap))
    }

    mark.framer_text,
    p.framer_text,
    div.framer_text,
    h1.framer_text,
    h2.framer_text,
    h3.framer_text,
    h4.framer_text,
    h5.framer_text,
    h6.framer_text,
    li.framer_text,
    ol.framer_text,
    ul.framer_text {
      background_color: "var(--framer-blockquote-text-background-color, var(--framer-text-background-color, initial))",
    framer_blockquote_text_background_radius, var(__framer_text_background_radius, initial));
      corner_shape: "var(--framer-blockquote-text-background-corner-shape, var(--framer-text-background-corner-shape, initial))",
    framer_blockquote_text_background_padding, var(__framer_text_background_padding, initial))
    }

    @supports not (color: "color(display-p3 1 1 1)) {

      p.framer-text,
      div.framer-text,
      h1.framer-text,
      h2.framer-text,
      h3.framer-text,
      h4.framer-text,
      h5.framer-text,
      h6.framer-text,
      li.framer-text,
      ol.framer-text,
      ul.framer-text,
      span.framer-text:not([data-text-fill]) {
        color: var(--framer-blockquote-text-color-rgb, var(--framer-blockquote-text-color, var(--framer-text-color-rgb, var(--framer-text-color, #000))))",
    framer_text_stroke_color_rgb, var(__framer_text_stroke_color, initial))
      }

      mark.framer_text {
        background_color: "var(--framer-blockquote-text-background-color-rgb, var(--framer-blockquote-text-background-color, var(--framer-text-background-color-rgb, var(--framer-text-background-color, initial))))
      }
    }

    .framer-fit-text .framer-text {
      white-space: nowrap",
    framer_blockquote_font_family_bold, var(__framer_font_family_bold));
      font_style: "var(--framer-blockquote-font-style-bold, var(--framer-font-style-bold))",
    framer_blockquote_font_weight_bold, var(__framer_font_weight_bold, bolder));
      font_variation_settings: "var(--framer-blockquote-font-variation-axes-bold, var(--framer-font-variation-axes-bold))
    }

    em.framer-text {
      font-family: var(--framer-blockquote-font-family-italic, var(--framer-font-family-italic))",
    framer_blockquote_font_style_italic, var(__framer_font_style_italic, italic));
      font_weight: "var(--framer-blockquote-font-weight-italic, var(--framer-font-weight-italic))",
    framer_blockquote_font_variation_axes_italic, var(__framer_font_variation_axes_italic))
    }

    em.framer_text>strong.framer_text {
      font_family: "var(--framer-blockquote-font-family-bold-italic, var(--framer-font-family-bold-italic))",
    framer_blockquote_font_style_bold_italic, var(__framer_font_style_bold_italic, italic));
      font_weight: "var(--framer-blockquote-font-weight-bold-italic, var(--framer-font-weight-bold-italic, bolder))",
    framer_blockquote_font_variation_axes_bold_italic, var(__framer_font_variation_axes_bold_italic))
    }

    p.framer_text: "not(:first-child),
    div.framer-text:not(:first-child),
    h1.framer-text:not(:first-child),
    h2.framer-text:not(:first-child),
    h3.framer-text:not(:first-child),
    h4.framer-text:not(:first-child),
    h5.framer-text:not(:first-child),
    h6.framer-text:not(:first-child),
    ol.framer-text:not(:first-child),
    ul.framer-text:not(:first-child),
    blockquote.framer-text:not(:first-child),
    table.framer-text:not(:first-child),
    figure.framer-text:not(:first-child),
    .framer-image.framer-text:not(:first-child) {
      margin-top: var(--framer-blockquote-paragraph-spacing, var(--framer-paragraph-spacing, 0))
    }

    li.framer-text>ul.framer-text:nth-child(2),
    li.framer-text>ol.framer-text:nth-child(2) {
      margin-top: 0
    }

    .framer-text[data-text-fill] {
      -webkit-text-fill-color: transparent",
    framer_blockquote_line_height, var(__framer_line_height, 1.3em)))/2));
      margin: "min(0em, calc(calc(1.3em - var(--framer-blockquote-line-height, var(--framer-line-height, 1.3em)))/-2))",
    framer_code_font_family, var(__framer_font_family, Inter, Inter Placeholder, sans_serif));
      font_style: "var(--framer-blockquote-font-style, var(--framer-code-font-style, var(--framer-font-style, normal)))",
    framer_blockquote_font_weight, var(__framer_code_font_weight, var(__framer_font_weight, 400)));
      color: "var(--framer-blockquote-text-color, var(--framer-code-text-color, var(--framer-text-color, #000)))",
  },

  // Color System
  colors: {
    // RGB Colors
    rgb: [
      "rgb(0, 0, 0)",
      "rgb(0, 153, 255)",
      "rgb(143, 143, 143)",
      "rgb(145, 145, 145)",
      "rgb(16, 16, 17)",
      "rgb(164, 164, 164)",
      "rgb(202, 204, 207)",
      "rgb(208, 165, 139)",
      "rgb(25, 25, 26)",
      "rgb(255, 255, 255)",
      "rgb(43, 43, 43)",
      "rgb(46, 46, 46)",
      "rgb(54, 54, 54)",
      "rgb(66, 52, 43)",
    ],
    // RGBA Colors
    rgba: [
      "rgba(0, 0, 0, 0)",
      "rgba(0, 0, 0, 0.12)",
      "rgba(0, 0, 0, 0.16)",
      "rgba(0, 0, 0, 0.2)",
      "rgba(0, 0, 0, 0.22)",
      "rgba(0, 0, 0, 0.23)",
      "rgba(0, 0, 0, 0.24)",
      "rgba(0, 0, 0, 0.27)",
      "rgba(255, 255, 255, 0.05)",
      "rgba(46, 46, 46, 0)",
    ],
  },

  // Typography System
  typography: {
    fontSizes: [
      "calc(var(--framer-blockquote-font-size, var(--framer-font-size, 16px))*var(--framer-font-size-scale, 1))",
      "16px",
      "12px
    }

    body {
      --token-e2b3e115-6772-4873-ba11-049b11b30d8f: #919191",
      "var(--font-size)",
      "var(--framer-font-size)",
      "var(--framer-link-font-size, var(--framer-font-size))",
      "var(--framer-link-hover-font-size, var(--framer-link-font-size, var(--framer-font-size)))",
      "var(--framer-link-current-font-size, var(--framer-link-font-size, var(--framer-font-size)))",
      "calc(var(--framer-blockquote-font-size, var(--framer-font-size, 16px))*var(--framer-font-size-scale, 1))
    }

    code.framer-text a.framer-text,
    code.framer-text span.framer-text[data-nested-link] {
      color: var(--framer-blockquote-text-color, var(--framer-link-text-color, var(--framer-code-text-color, var(--framer-text-color, #000))))
    }

    @supports not (color:color(display-p3 1 1 1)) {

      code.framer-text a.framer-text,
      code.framer-text a.framer-text span.framer-text:not([data-text-fill]),
      code.framer-text span.framer-text[data-nested-link],
      code.framer-text span.framer-text[data-nested-link] span.framer-text:not([data-text-fill]) {
        color: var(--framer-blockquote-text-color-rgb, var(--framer-blockquote-text-color, var(--framer-link-text-color-rgb, var(--framer-link-text-color, var(--framer-code-text-color-rgb, var(--framer-code-text-color, var(--framer-text-color-rgb, var(--framer-text-color, #000))))))))
      }
    }

    a.framer-text:hover,
    a.framer-text:hover span.framer-text:not([data-text-fill]),
    span.framer-text[data-nested-link]:hover,
    span.framer-text[data-nested-link]:hover span.framer-text:not([data-text-fill]) {
      font-family: var(--framer-link-hover-font-family, var(--framer-blockquote-font-family, var(--framer-link-font-family, var(--framer-font-family, Inter, Inter Placeholder, sans-serif))))",
      "calc(var(--framer-link-hover-font-size, var(--framer-blockquote-font-size, var(--framer-font-size, 16px)))*var(--framer-font-size-scale, 1))",
      "calc(var(--framer-link-current-font-size, var(--framer-link-font-size, var(--framer-font-size, 16px)))*var(--framer-font-size-scale, 1))",
      "calc(var(--framer-link-current-font-size, var(--framer-link-font-size, var(--framer-font-size, 16px)))*var(--framer-font-size-scale, 1))
    }

    code.framer-text a.framer-text[data-framer-page-link-current],
    code.framer-text span.framer-text[data-framer-page-link-current] {
      color: var(--framer-link-current-text-color, var(--framer-link-text-color, var(--framer-code-text-color, var(--framer-text-color, #000))))
    }

    @supports not (color:color(display-p3 1 1 1)) {

      code.framer-text a.framer-text[data-framer-page-link-current],
      code.framer-text a.framer-text[data-framer-page-link-current] span.framer-text:not([data-text-fill]),
      code.framer-text span.framer-text[data-framer-page-link-current],
      code.framer-text span.framer-text[data-framer-page-link-current] span.framer-text:not([data-text-fill]) {
        color: var(--framer-link-current-text-color-rgb, var(--framer-link-current-text-color, var(--framer-link-text-color-rgb, var(--framer-link-text-color, var(--framer-code-text-color-rgb, var(--framer-code-text-color, var(--framer-text-color-rgb, var(--framer-text-color, #000))))))))",
      "calc(var(--framer-link-hover-font-size, var(--framer-link-current-font-size, var(--framer-link-font-size, var(--framer-font-size, 16px))))*var(--framer-font-size-scale, 1))",
      "var(--framer-font-size, 16px)",
      "var(--framer-link-font-size, var(--framer-font-size, 16px))",
      "var(--framer-link-hover-font-size, var(--framer-link-font-size, var(--framer-font-size, 16px)))",
      "var(--framer-link-current-font-size, var(--framer-link-font-size, var(--framer-font-size, 16px)))",
      "var(--framer-link-hover-font-size, var(--framer-link-current-font-size, var(--framer-link-font-size, var(--framer-font-size, 16px))))",
      "48px",
      "32px",
    ],
    fontWeights: [
      "400",
      "500",
      "700",
      "bolder
    }

    [data-framer-component-type=DeprecatedRichText] em {
      font-style: italic
    }

    [data-framer-component-type=DeprecatedRichText] .framer-image {
      max-width: 100%",
      "min(calc(var(--framer-font-weight-increase, 0) + var(--font-weight, 400)), 900)",
      "var(--framer-blockquote-font-weight, var(--framer-code-font-weight, var(--framer-font-weight, 400)))",
      "var(--framer-blockquote-font-weight, var(--framer-font-weight, 400))",
      "var(--framer-blockquote-font-weight, var(--framer-link-font-weight, var(--framer-font-weight, 400)))",
      "var(--framer-blockquote-font-weight-bold, var(--framer-font-weight-bold, bolder))",
      "var(--framer-blockquote-font-weight-bold-italic, var(--framer-font-weight-bold-italic, bolder))",
      "var(--framer-blockquote-font-weight-italic, var(--framer-font-weight-italic))",
      "var(--framer-code-font-weight, var(--framer-font-weight, 400))",
      "var(--framer-font-weight)",
      "var(--framer-font-weight, 400)",
      "var(--framer-link-current-font-weight, var(--framer-link-font-weight, var(--framer-font-weight)))",
      "var(--framer-link-current-font-weight, var(--framer-link-font-weight, var(--framer-font-weight, 400)))",
      "var(--framer-link-font-weight, var(--framer-font-weight))",
      "var(--framer-link-font-weight, var(--framer-font-weight, 400))",
      "var(--framer-link-hover-font-weight, var(--framer-blockquote-font-weight, var(--framer-link-font-weight, var(--framer-font-weight, 400))))",
      "var(--framer-link-hover-font-weight, var(--framer-link-current-font-weight, var(--framer-link-font-weight, var(--framer-font-weight, 400))))",
      "var(--framer-link-hover-font-weight, var(--framer-link-font-weight, var(--framer-font-weight)))",
      "var(--framer-link-hover-font-weight, var(--framer-link-font-weight, var(--framer-font-weight, 400)))",
    ],
    lineHeights: [
      "1.2em",
      "110%",
      "120%",
      "140%",
      "var(--framer-blockquote-line-height, var(--framer-line-height, 1.2em))",
      "var(--framer-blockquote-line-height, var(--framer-line-height, 1.2em))
    }

    @supports not (color:color(display-p3 1 1 1)) {

      code.framer-text,
      code.framer-text span.framer-text:not([data-text-fill]) {
        color: var(--framer-blockquote-text-color-rgb, var(--framer-blockquote-text-color, var(--framer-code-text-color-rgb, var(--framer-code-text-color, var(--framer-text-color-rgb, var(--framer-text-color, #000))))))
      }
    }

    blockquote.framer-text {
      unicode-bidi: initial",
      "var(--framer-line-height)
    }

    [data-framer-component-type=Text] a,
    [data-framer-component-type=Text] a div span,
    [data-framer-component-type=Text] a span span span,
    [data-framer-component-type=Text] a p span span,
    [data-framer-component-type=Text] a h1 span span,
    [data-framer-component-type=Text] a h2 span span,
    [data-framer-component-type=Text] a h3 span span,
    [data-framer-component-type=Text] a h4 span span,
    [data-framer-component-type=Text] a h5 span span,
    [data-framer-component-type=Text] a h6 span span {
      --font-family: var(--framer-link-font-family, var(--framer-font-family))",
      "var(--framer-line-height, 1.2em)",
      "var(--line-height)",
    ],
    letterSpacings: [
      "0",
      "0em",
      "0px",
      "var(--framer-blockquote-letter-spacing, var(--framer-letter-spacing, 0))",
      "var(--framer-letter-spacing)",
      "var(--framer-letter-spacing, 0)",
      "var(--letter-spacing)",
    ],
    fontFamilies: [
      ""Inter", sans-serif",
      "var(--framer-link-font-family, var(--framer-font-family, Inter, Inter Placeholder, sans-serif))",
      "var(--framer-blockquote-font-family, var(--framer-link-font-family, var(--framer-font-family, Inter, Inter Placeholder, sans-serif)))",
      "var(--framer-blockquote-font-family-bold-italic, var(--framer-font-family-bold-italic))",
      "Inter, Inter Placeholder, sans-serif",
      ""Inter", "Inter Placeholder", sans-serif",
      "var(--framer-link-hover-font-family, var(--framer-link-font-family, var(--framer-font-family, Inter, Inter Placeholder, sans-serif)))",
      "var(--framer-link-hover-font-family, var(--framer-link-font-family, var(--framer-font-family)))",
      "var(--framer-blockquote-font-family-italic, var(--framer-font-family-italic))",
      "var(--framer-code-font-family, var(--framer-font-family, Inter, Inter Placeholder, sans-serif))",
      "var(--framer-blockquote-font-family-bold, var(--framer-font-family-bold))",
      "var(--framer-link-hover-font-family, var(--framer-blockquote-font-family, var(--framer-link-font-family, var(--framer-font-family, Inter, Inter Placeholder, sans-serif))))",
      ""Inter Placeholder"",
      "var(--framer-font-family, Inter, Inter Placeholder, sans-serif)",
      "var(--font-family)",
      "var(--framer-link-hover-font-family, var(--framer-link-current-font-family, var(--framer-link-font-family, var(--framer-font-family, Inter, Inter Placeholder, sans-serif))))",
      "sans-serif",
      ""Inter"",
      "var(--framer-link-current-font-family, var(--framer-link-font-family, var(--framer-font-family, Inter, Inter Placeholder, sans-serif)))",
      "var(--framer-font-family)",
      "var(--framer-link-current-font-family, var(--framer-link-font-family, var(--framer-font-family)))",
      "var(--framer-blockquote-font-family, var(--framer-font-family, Inter, Inter Placeholder, sans-serif))",
      "var(--framer-link-font-family, var(--framer-font-family))",
    ],
  },

  // Spacing System
  spacing: {
    margin: [
      "0",
      "0
    }

    .flexbox-gap-not-supported [data-framer-stack-direction-reverse=false] [data-framer-legacy-stack-gap-enabled=true]>:last-child,
    [data-framer-stack-direction-reverse=false] [data-framer-legacy-stack-gap-enabled=true][data-framer-stack-flexbox-gap=false]>:last-child,
    .flexbox-gap-not-supported [data-framer-stack-direction-reverse=true] [data-framer-legacy-stack-gap-enabled=true]>:first-child,
    [data-framer-stack-direction-reverse=true] [data-framer-legacy-stack-gap-enabled=true][data-framer-stack-flexbox-gap=false]>:first-child {
      margin-bottom: 0",
      "0
    }

    .framer-PJB7o[data-border=true]:after,
    .framer-PJB7o [data-border=true]:after {
      content: """,
      "0
    }

    NavigationContainer [data-framer-component-type=NavigationContainer]>*,
    [data-framer-component-type=NavigationContainer]>[data-framer-component-type] {
      position: relative
    }

    [data-framer-component-type=Scroll]::-webkit-scrollbar {
      display: none
    }

    [data-framer-component-type=ScrollContentWrapper]>* {
      position: relative
    }

    [data-framer-component-type=NativeScroll] {
      -webkit-overflow-scrolling: touch
    }

    [data-framer-component-type=NativeScroll]>* {
      position: relative
    }

    [data-framer-component-type=NativeScroll].direction-both {
      overflow: auto
    }

    [data-framer-component-type=NativeScroll].direction-vertical {
      overflow: hidden auto
    }

    [data-framer-component-type=NativeScroll].direction-horizontal {
      overflow: auto hidden
    }

    [data-framer-component-type=NativeScroll].direction-vertical>* {
      width: 100% !important
    }

    [data-framer-component-type=NativeScroll].direction-horizontal>* {
      height: 100% !important
    }

    [data-framer-component-type=NativeScroll].scrollbar-hidden::-webkit-scrollbar {
      display: none
    }

    [data-framer-component-type=PageContentWrapper]>*,
    [data-framer-component-type=PageContentWrapper]>[data-framer-component-type] {
      position: relative
    }

    [data-framer-component-type=DeviceComponent].no-device>* {
      width: 100% !important",
      "0
    }

    body,
    input,
    textarea,
    select,
    button {
      font-family: sans-serif",
      "160px",
      "calc(var(--stack-gap-x)/2)",
      "calc(var(--stack-gap-x)/2)
    }

    [data-framer-stack-content-wrapper][data-framer-stack-gap-enabled=true] {
      row-gap: var(--stack-native-row-gap)",
      "calc(var(--stack-gap-y)/2)",
      "min(0em, calc(calc(1.3em - var(--framer-blockquote-line-height, var(--framer-line-height, 1.3em)))/-2))",
      "var(--framer-blockquote-paragraph-spacing, var(--framer-paragraph-spacing, 0))
    }

    li.framer-text>ul.framer-text:nth-child(2),
    li.framer-text>ol.framer-text:nth-child(2) {
      margin-top: 0
    }

    .framer-text[data-text-fill] {
      -webkit-text-fill-color: transparent",
      "var(--framer-paragraph-spacing, 0)
    }

    [data-framer-component-type=DeprecatedRichText] span[data-text-fill] {
      -webkit-text-fill-color: transparent",
    ],
    padding: [
      ".75ch",
      "0",
      "0
    }

    .framer-5nLin.framer-v-1h8hn76 .framer-ddznwx,
    .framer-5nLin.framer-v-1fl22sp.hover .framer-ddznwx {
      height: var(--framer-aspect-ratio-supported, 24px)
    }

    .framer-5nLin.framer-v-1h8hn76 .framer-njqptp {
      flex-direction: column",
      "0
    }

    :root {
      -webkit-font-smoothing: antialiased",
      "0
    }

    [data-framer-component-type=DeprecatedRichText] p,
    [data-framer-component-type=DeprecatedRichText] div,
    [data-framer-component-type=DeprecatedRichText] h1,
    [data-framer-component-type=DeprecatedRichText] h2,
    [data-framer-component-type=DeprecatedRichText] h3,
    [data-framer-component-type=DeprecatedRichText] h4,
    [data-framer-component-type=DeprecatedRichText] h5,
    [data-framer-component-type=DeprecatedRichText] h6,
    [data-framer-component-type=DeprecatedRichText] li,
    [data-framer-component-type=DeprecatedRichText] ol,
    [data-framer-component-type=DeprecatedRichText] ul,
    [data-framer-component-type=DeprecatedRichText] span:not([data-text-fill]) {
      font-family: var(--framer-font-family, Inter, Inter Placeholder, sans-serif)",
      "0
    }

    [data-hide-scrollbars=true]::-webkit-scrollbar {
      width: 0",
      "0
    }

    p.framer-text,
    div.framer-text,
    h1.framer-text,
    h2.framer-text,
    h3.framer-text,
    h4.framer-text,
    h5.framer-text,
    h6.framer-text,
    li.framer-text,
    ol.framer-text,
    ul.framer-text,
    mark.framer-text,
    span.framer-text:not([data-text-fill]) {
      font-family: var(--framer-blockquote-font-family, var(--framer-font-family, Inter, Inter Placeholder, sans-serif))",
      "0 0 16px",
      "0 16px",
      "120px 16px 40px
      }

      .framer-04bwI .framer-1xephhc,
      .framer-04bwI .framer-2hzbhl,
      .framer-04bwI .framer-2qmcsh,
      .framer-04bwI .framer-1txkx1v,
      .framer-04bwI .framer-vjcol7 {
        padding: 40px 16px
      }
    }

    @media (max-width:809.98px) {
      .framer-04bwI.framer-72rtr7 {
        width: 390px
      }

      .framer-04bwI .framer-1ltys2d {
        padding: 60px 16px 40px
      }

      .framer-04bwI .framer-17vpry1,
      .framer-04bwI .framer-h8i4t,
      .framer-04bwI .framer-hc5kqi,
      .framer-04bwI .framer-ube1dm,
      .framer-04bwI .framer-i4056b {
        flex-direction: column",
      "120px 16px 60px",
      "16px",
      "16px 0 0
    }

    .framer-IqW13 .framer-styles-preset-1a67nrz:not(.rich-text-wrapper),
    .framer-IqW13 .framer-styles-preset-1a67nrz.rich-text-wrapper a {
      --framer-link-current-text-decoration: none",
      "20px",
      "24px 16px",
      "2px 8px",
      "40px 16px
      }

      .framer-04bwI .framer-1q4umqi,
      .framer-04bwI .framer-1gy92vz,
      .framer-04bwI .framer-oko0t,
      .framer-04bwI .framer-xbfosg {
        top: unset",
      "4px 8px",
      "60px 16px",
      "8px 16px",
    ],
    gap: [
      "0",
      "10px",
      "12px",
      "16px",
      "24px",
      "24px
      }

      .framer-04bwI .framer-veaqys,
      .framer-04bwI .framer-lbdg8n {
        flex: none",
      "2px",
      "32px",
      "4px",
      "8px",
      "8px 16px",
      "unset",
      "unset
    }

    .flexbox-gap-not-supported [data-framer-stack-direction-reverse=false] [data-framer-legacy-stack-gap-enabled=true]>:first-child,
    [data-framer-stack-direction-reverse=false] [data-framer-legacy-stack-gap-enabled=true][data-framer-stack-flexbox-gap=false]>:first-child,
    .flexbox-gap-not-supported [data-framer-stack-direction-reverse=true] [data-framer-legacy-stack-gap-enabled=true]>:last-child,
    [data-framer-stack-direction-reverse=true] [data-framer-legacy-stack-gap-enabled=true][data-framer-stack-flexbox-gap=false]>:last-child {
      margin-top: 0",
      "var(--stack-native-column-gap)
    }

    .flexbox-gap-not-supported [data-framer-stack-content-wrapper][data-framer-stack-gap-enabled=true] {
      row-gap: unset",
      "var(--stack-native-row-gap)",
    ],
  },

  // Border System
  borders: {
    radius: [
      "12px",
      "12px">
                              <div class="framer-zinin7">
                                <div
                                  style="position:absolute",
      "16px",
      "4px",
      "8px",
      "8px">
                  <div class="framer-1thbdw" data-framer-name="Icon Wrapper" style="background-color:rgba(0, 0, 0, 0)">
                    <svg class="framer-iZmZi framer-1fcujqa" role="presentation" viewBox="0 0 24 24"
                      style="--1m6trwb:0",
      "inherit",
      "var(--framer-blockquote-text-background-radius, var(--framer-text-background-radius, initial))",
      "var(--framer-link-current-text-background-radius, var(--framer-link-text-background-radius, initial))",
      "var(--framer-link-hover-text-background-radius, var(--framer-link-current-text-background-radius, var(--framer-link-text-background-radius, initial)))",
      "var(--framer-link-hover-text-background-radius, var(--framer-link-text-background-radius, var(--framer-text-background-radius, initial)))",
      "var(--framer-link-text-background-radius, initial)",
    ],
  },

  // Effects
  effects: {
    boxShadows: [
      "0 .706592px .423955px -.5px #0000003d, 0 1.80656px 1.08394px -1px #0000003d, 0 3.62176px 2.17306px -1.5px #0000003b, 0 6.8656px 4.11936px -2px #00000038, 0 13.6468px 8.18806px -2.5px #0003, 0 30px 18px -3px #00000029
    }

    .framer-04bwI .framer-10kzksk {
      --border-bottom-width: 1px",
      "0px 0.6021873017743928px 1.5656869846134214px -1.1666666666666665px rgba(0, 0, 0, 0.27), 0px 2.288533303243457px 5.950186588432988px -2.333333333333333px rgba(0, 0, 0, 0.24), 0px 10px 26px -3.5px rgba(0, 0, 0, 0.12)\">
                            <svg class=\"framer-VHcoG framer-ddznwx\" role=\"presentation\" viewBox=\"0 0 24 24\"
                              style=\"--1m6trwb:0",
      "0px 0.7065919983928324px 0.4239551990356995px -0.5px rgba(0, 0, 0, 0.24), 0px 1.8065619053231785px 1.0839371431939073px -1px rgba(0, 0, 0, 0.24), 0px 3.6217592146567767px 2.1730555287940665px -1.5px rgba(0, 0, 0, 0.23), 0px 6.8655999097303715px 4.119359945838224px -2px rgba(0, 0, 0, 0.22), 0px 13.646761411524492px 8.188056846914698px -2.5px rgba(0, 0, 0, 0.2), 0px 30px 18.000000000000004px -3px rgba(0, 0, 0, 0.16)\">
                                <div class=\"framer-wtdqw2\" data-framer-component-type=\"RichTextContainer\"
                                  style=\"--extracted-r6o4lv:var(--token-c89ea9f4-1c08-4225-bee9-c2e710a47467, rgb(208, 165, 139))",
      "0px 0.7065919983928324px 0.4239551990356995px -0.5px rgba(0, 0, 0, 0.24), 0px 1.8065619053231785px 1.0839371431939073px -1px rgba(0, 0, 0, 0.24), 0px 3.6217592146567767px 2.1730555287940665px -1.5px rgba(0, 0, 0, 0.23), 0px 6.8655999097303715px 4.119359945838224px -2px rgba(0, 0, 0, 0.22), 0px 13.646761411524492px 8.188056846914698px -2.5px rgba(0, 0, 0, 0.2), 0px 30px 18.000000000000004px -3px rgba(0, 0, 0, 0.16)\">
                        <div class=\"framer-15qn0n7\" data-framer-name=\"Inner Wrapper\">
                          <div class=\"framer-4l2nfh\" data-framer-name=\"Button\"
                            style=\"background-color:var(--token-ecc20de8-44f8-460d-8567-5b1e87c8db9d, rgb(25, 25, 26))",
      "0px 0.7065919983928324px 0.4239551990356995px -0.5px rgba(0, 0, 0, 0.24), 0px 1.8065619053231785px 1.0839371431939073px -1px rgba(0, 0, 0, 0.24), 0px 3.6217592146567767px 2.1730555287940665px -1.5px rgba(0, 0, 0, 0.23), 0px 6.8655999097303715px 4.119359945838224px -2px rgba(0, 0, 0, 0.22), 0px 13.646761411524492px 8.188056846914698px -2.5px rgba(0, 0, 0, 0.2), 0px 30px 18.000000000000004px -3px rgba(0, 0, 0, 0.16)\">
                        <div class=\"framer-15qn0n7\" data-framer-name=\"Inner Wrapper\">
                          <div class=\"framer-njqptp\" data-framer-name=\"Content\">
                            <div class=\"framer-1oij2ip\" data-framer-name=\"Logo\"
                              style=\"background-color:var(--token-ecc20de8-44f8-460d-8567-5b1e87c8db9d, rgb(25, 25, 26))",
    ],
    backdropFilters: [
      "blur(10px)",
    ],
  },
} as const;

export type Tokens = typeof tokens;
