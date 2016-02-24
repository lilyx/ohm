var ohm = require('..');
module.exports = ohm.makeRecipe(function() {
  var decl = this.newGrammar("Ohm")
    .withSource("Ohm {\n\n  Grammars\n    = Grammar*\n\n  Grammar\n    = ident SuperGrammar? \"{\" Rule* \"}\"\n\n  SuperGrammar\n    = \"<:\" ident\n\n  Rule\n    = ident Formals? ruleDescr? \"=\"  Alt  -- define\n    | ident Formals?            \":=\" Alt  -- override\n    | ident Formals?            \"+=\" Alt  -- extend\n\n  Formals\n    = \"<\" ListOf<ident, \",\"> \">\"\n\n  Params\n    = \"<\" ListOf<Seq, \",\"> \">\"\n\n  Alt\n    = Term (\"|\" Term)*\n\n  Term\n    = Seq caseName -- inline\n    | Seq\n\n  Seq\n    = Iter*\n\n  Iter\n    = Pred \"*\"  -- star\n    | Pred \"+\"  -- plus\n    | Pred \"?\"  -- opt\n    | Pred\n\n  Pred\n    = \"~\" Modifier  -- not\n    | \"&\" Modifier  -- lookahead\n    | Modifier\n\n  Modifier\n    = \"#\" Base  -- lex\n    | \"$\" Base  -- val\n    | Base\n\n  Base\n    = ident Params? ~(ruleDescr? \"=\" | \":=\" | \"+=\")  -- application\n    | Prim \"..\" Prim                                 -- range\n    | Prim                                           -- prim\n    | \"(\" Alt \")\"                                    -- paren\n    | \"[\" Alt \"]\"                                    -- arr\n    | \"{\" \"...\"? \"}\"                                 -- obj\n    | \"{\" Props (\",\" \"...\")? \"}\"                     -- objWithProps\n\n  Prim\n    = keyword\n    | string\n    | number\n\n  Props\n    = Prop (\",\" Prop)*\n\n  Prop\n    = (name | string) \":\" Alt\n\n  ruleDescr  (a rule description)\n    = \"(\" ruleDescrText \")\"\n\n  ruleDescrText\n    = (~\")\" any)*\n\n  caseName\n    = \"--\" (~\"\\n\" space)* name (~\"\\n\" space)* (\"\\n\" | &\"}\")\n\n  name  (a name)\n    = nameFirst nameRest*\n\n  nameFirst\n    = \"_\"\n    | letter\n\n  nameRest\n    = \"_\"\n    | alnum\n\n  ident  (an identifier)\n    = ~keyword name\n\n  keyword\n    = \"null\" ~nameRest   -- null\n    | \"true\" ~nameRest   -- true\n    | \"false\" ~nameRest  -- false\n\n  string\n    = \"\\\"\" strChar* \"\\\"\"\n\n  strChar\n    = escapeChar\n    | ~\"\\\\\" ~\"\\\"\" ~\"\\n\" any\n\n  escapeChar  (an escape sequence)\n    = \"\\\\\\\\\"                                     -- backslash\n    | \"\\\\\\\"\"                                     -- doubleQuote\n    | \"\\\\\\'\"                                     -- singleQuote\n    | \"\\\\b\"                                      -- backspace\n    | \"\\\\n\"                                      -- lineFeed\n    | \"\\\\r\"                                      -- carriageReturn\n    | \"\\\\t\"                                      -- tab\n    | \"\\\\u\" hexDigit hexDigit hexDigit hexDigit  -- unicodeEscape\n    | \"\\\\x\" hexDigit hexDigit                    -- hexEscape\n\n  number  (a number)\n    = \"-\"? digit+\n\n  space\n   += comment\n\n  comment\n    = \"//\" (~\"\\n\" any)* \"\\n\"  -- singleLine\n    | \"/*\" (~\"*/\" any)* \"*/\"  -- multiLine\n\n  tokens = token*\n\n  token = caseName | comment | ident | keyword | number | operator | punctuation | string | any\n\n  operator = \"<:\" | \"=\" | \":=\" | \"+=\" | \"*\" | \"+\" | \"?\" | \"~\" | \"&\"\n\n  punctuation = \"<\" | \">\" | \",\" | \"--\"\n}")
    .withDefaultStartRule("Grammars")
  return decl
    .define("Grammars", [], this.star(this.app("Grammar").withInterval(decl.sourceInterval(24, 31))).withInterval(decl.sourceInterval(24, 32)))
    .define("Grammar", [], this.seq(this.app("ident").withInterval(decl.sourceInterval(50, 55)), this.opt(this.app("SuperGrammar").withInterval(decl.sourceInterval(56, 68))).withInterval(decl.sourceInterval(56, 69)), this.prim("{").withInterval(decl.sourceInterval(70, 73)), this.star(this.app("Rule").withInterval(decl.sourceInterval(74, 78))).withInterval(decl.sourceInterval(74, 79)), this.prim("}").withInterval(decl.sourceInterval(80, 83))).withInterval(decl.sourceInterval(50, 83)))
    .define("SuperGrammar", [], this.seq(this.prim("<:").withInterval(decl.sourceInterval(106, 110)), this.app("ident").withInterval(decl.sourceInterval(111, 116))).withInterval(decl.sourceInterval(106, 116)))
    .define("Rule_define", [], this.seq(this.app("ident").withInterval(decl.sourceInterval(131, 136)), this.opt(this.app("Formals").withInterval(decl.sourceInterval(137, 144))).withInterval(decl.sourceInterval(137, 145)), this.opt(this.app("ruleDescr").withInterval(decl.sourceInterval(146, 155))).withInterval(decl.sourceInterval(146, 156)), this.prim("=").withInterval(decl.sourceInterval(157, 160)), this.app("Alt").withInterval(decl.sourceInterval(162, 165))).withInterval(decl.sourceInterval(131, 165)))
    .define("Rule_override", [], this.seq(this.app("ident").withInterval(decl.sourceInterval(183, 188)), this.opt(this.app("Formals").withInterval(decl.sourceInterval(189, 196))).withInterval(decl.sourceInterval(189, 197)), this.prim(":=").withInterval(decl.sourceInterval(209, 213)), this.app("Alt").withInterval(decl.sourceInterval(214, 217))).withInterval(decl.sourceInterval(183, 217)))
    .define("Rule_extend", [], this.seq(this.app("ident").withInterval(decl.sourceInterval(237, 242)), this.opt(this.app("Formals").withInterval(decl.sourceInterval(243, 250))).withInterval(decl.sourceInterval(243, 251)), this.prim("+=").withInterval(decl.sourceInterval(263, 267)), this.app("Alt").withInterval(decl.sourceInterval(268, 271))).withInterval(decl.sourceInterval(237, 271)))
    .define("Rule", [], this.alt(this.app("Rule_define").withInterval(decl.sourceInterval(131, 165)), this.app("Rule_override").withInterval(decl.sourceInterval(183, 217)), this.app("Rule_extend").withInterval(decl.sourceInterval(237, 271))).withInterval(decl.sourceInterval(131, 282)))
    .define("Formals", [], this.seq(this.prim("<").withInterval(decl.sourceInterval(300, 303)), this.app("ListOf", [this.app("ident").withInterval(decl.sourceInterval(311, 316)), this.prim(",").withInterval(decl.sourceInterval(318, 321))]).withInterval(decl.sourceInterval(304, 322)), this.prim(">").withInterval(decl.sourceInterval(323, 326))).withInterval(decl.sourceInterval(300, 326)))
    .define("Params", [], this.seq(this.prim("<").withInterval(decl.sourceInterval(343, 346)), this.app("ListOf", [this.app("Seq").withInterval(decl.sourceInterval(354, 357)), this.prim(",").withInterval(decl.sourceInterval(359, 362))]).withInterval(decl.sourceInterval(347, 363)), this.prim(">").withInterval(decl.sourceInterval(364, 367))).withInterval(decl.sourceInterval(343, 367)))
    .define("Alt", [], this.seq(this.app("Term").withInterval(decl.sourceInterval(381, 385)), this.star(this.seq(this.prim("|").withInterval(decl.sourceInterval(387, 390)), this.app("Term").withInterval(decl.sourceInterval(391, 395))).withInterval(decl.sourceInterval(387, 395))).withInterval(decl.sourceInterval(386, 397))).withInterval(decl.sourceInterval(381, 397)))
    .define("Term_inline", [], this.seq(this.app("Seq").withInterval(decl.sourceInterval(412, 415)), this.app("caseName").withInterval(decl.sourceInterval(416, 424))).withInterval(decl.sourceInterval(412, 424)))
    .define("Term", [], this.alt(this.app("Term_inline").withInterval(decl.sourceInterval(412, 424)), this.app("Seq").withInterval(decl.sourceInterval(441, 444))).withInterval(decl.sourceInterval(412, 444)))
    .define("Seq", [], this.star(this.app("Iter").withInterval(decl.sourceInterval(458, 462))).withInterval(decl.sourceInterval(458, 463)))
    .define("Iter_star", [], this.seq(this.app("Pred").withInterval(decl.sourceInterval(478, 482)), this.prim("*").withInterval(decl.sourceInterval(483, 486))).withInterval(decl.sourceInterval(478, 486)))
    .define("Iter_plus", [], this.seq(this.app("Pred").withInterval(decl.sourceInterval(502, 506)), this.prim("+").withInterval(decl.sourceInterval(507, 510))).withInterval(decl.sourceInterval(502, 510)))
    .define("Iter_opt", [], this.seq(this.app("Pred").withInterval(decl.sourceInterval(526, 530)), this.prim("?").withInterval(decl.sourceInterval(531, 534))).withInterval(decl.sourceInterval(526, 534)))
    .define("Iter", [], this.alt(this.app("Iter_star").withInterval(decl.sourceInterval(478, 486)), this.app("Iter_plus").withInterval(decl.sourceInterval(502, 510)), this.app("Iter_opt").withInterval(decl.sourceInterval(526, 534)), this.app("Pred").withInterval(decl.sourceInterval(549, 553))).withInterval(decl.sourceInterval(478, 553)))
    .define("Pred_not", [], this.seq(this.prim("~").withInterval(decl.sourceInterval(568, 571)), this.app("Modifier").withInterval(decl.sourceInterval(572, 580))).withInterval(decl.sourceInterval(568, 580)))
    .define("Pred_lookahead", [], this.seq(this.prim("&").withInterval(decl.sourceInterval(595, 598)), this.app("Modifier").withInterval(decl.sourceInterval(599, 607))).withInterval(decl.sourceInterval(595, 607)))
    .define("Pred", [], this.alt(this.app("Pred_not").withInterval(decl.sourceInterval(568, 580)), this.app("Pred_lookahead").withInterval(decl.sourceInterval(595, 607)), this.app("Modifier").withInterval(decl.sourceInterval(628, 636))).withInterval(decl.sourceInterval(568, 636)))
    .define("Modifier_lex", [], this.seq(this.prim("#").withInterval(decl.sourceInterval(655, 658)), this.app("Base").withInterval(decl.sourceInterval(659, 663))).withInterval(decl.sourceInterval(655, 663)))
    .define("Modifier_val", [], this.seq(this.prim("$").withInterval(decl.sourceInterval(678, 681)), this.app("Base").withInterval(decl.sourceInterval(682, 686))).withInterval(decl.sourceInterval(678, 686)))
    .define("Modifier", [], this.alt(this.app("Modifier_lex").withInterval(decl.sourceInterval(655, 663)), this.app("Modifier_val").withInterval(decl.sourceInterval(678, 686)), this.app("Base").withInterval(decl.sourceInterval(701, 705))).withInterval(decl.sourceInterval(655, 705)))
    .define("Base_application", [], this.seq(this.app("ident").withInterval(decl.sourceInterval(720, 725)), this.opt(this.app("Params").withInterval(decl.sourceInterval(726, 732))).withInterval(decl.sourceInterval(726, 733)), this.not(this.alt(this.seq(this.opt(this.app("ruleDescr").withInterval(decl.sourceInterval(736, 745))).withInterval(decl.sourceInterval(736, 746)), this.prim("=").withInterval(decl.sourceInterval(747, 750))).withInterval(decl.sourceInterval(736, 750)), this.prim(":=").withInterval(decl.sourceInterval(753, 757)), this.prim("+=").withInterval(decl.sourceInterval(760, 764))).withInterval(decl.sourceInterval(736, 764))).withInterval(decl.sourceInterval(734, 765))).withInterval(decl.sourceInterval(720, 765)))
    .define("Base_range", [], this.seq(this.app("Prim").withInterval(decl.sourceInterval(788, 792)), this.prim("..").withInterval(decl.sourceInterval(793, 797)), this.app("Prim").withInterval(decl.sourceInterval(798, 802))).withInterval(decl.sourceInterval(788, 802)))
    .define("Base_prim", [], this.app("Prim").withInterval(decl.sourceInterval(850, 854)))
    .define("Base_paren", [], this.seq(this.prim("(").withInterval(decl.sourceInterval(911, 914)), this.app("Alt").withInterval(decl.sourceInterval(915, 918)), this.prim(")").withInterval(decl.sourceInterval(919, 922))).withInterval(decl.sourceInterval(911, 922)))
    .define("Base_arr", [], this.seq(this.prim("[").withInterval(decl.sourceInterval(973, 976)), this.app("Alt").withInterval(decl.sourceInterval(977, 980)), this.prim("]").withInterval(decl.sourceInterval(981, 984))).withInterval(decl.sourceInterval(973, 984)))
    .define("Base_obj", [], this.seq(this.prim("{").withInterval(decl.sourceInterval(1033, 1036)), this.opt(this.prim("...").withInterval(decl.sourceInterval(1037, 1042))).withInterval(decl.sourceInterval(1037, 1043)), this.prim("}").withInterval(decl.sourceInterval(1044, 1047))).withInterval(decl.sourceInterval(1033, 1047)))
    .define("Base_objWithProps", [], this.seq(this.prim("{").withInterval(decl.sourceInterval(1093, 1096)), this.app("Props").withInterval(decl.sourceInterval(1097, 1102)), this.opt(this.seq(this.prim(",").withInterval(decl.sourceInterval(1104, 1107)), this.prim("...").withInterval(decl.sourceInterval(1108, 1113))).withInterval(decl.sourceInterval(1104, 1113))).withInterval(decl.sourceInterval(1103, 1115)), this.prim("}").withInterval(decl.sourceInterval(1116, 1119))).withInterval(decl.sourceInterval(1093, 1119)))
    .define("Base", [], this.alt(this.app("Base_application").withInterval(decl.sourceInterval(720, 765)), this.app("Base_range").withInterval(decl.sourceInterval(788, 802)), this.app("Base_prim").withInterval(decl.sourceInterval(850, 854)), this.app("Base_paren").withInterval(decl.sourceInterval(911, 922)), this.app("Base_arr").withInterval(decl.sourceInterval(973, 984)), this.app("Base_obj").withInterval(decl.sourceInterval(1033, 1047)), this.app("Base_objWithProps").withInterval(decl.sourceInterval(1093, 1119))).withInterval(decl.sourceInterval(720, 1155)))
    .define("Prim", [], this.alt(this.app("keyword").withInterval(decl.sourceInterval(1170, 1177)), this.app("string").withInterval(decl.sourceInterval(1184, 1190)), this.app("number").withInterval(decl.sourceInterval(1197, 1203))).withInterval(decl.sourceInterval(1170, 1203)))
    .define("Props", [], this.seq(this.app("Prop").withInterval(decl.sourceInterval(1219, 1223)), this.star(this.seq(this.prim(",").withInterval(decl.sourceInterval(1225, 1228)), this.app("Prop").withInterval(decl.sourceInterval(1229, 1233))).withInterval(decl.sourceInterval(1225, 1233))).withInterval(decl.sourceInterval(1224, 1235))).withInterval(decl.sourceInterval(1219, 1235)))
    .define("Prop", [], this.seq(this.alt(this.app("name").withInterval(decl.sourceInterval(1251, 1255)), this.app("string").withInterval(decl.sourceInterval(1258, 1264))).withInterval(decl.sourceInterval(1251, 1264)), this.prim(":").withInterval(decl.sourceInterval(1266, 1269)), this.app("Alt").withInterval(decl.sourceInterval(1270, 1273))).withInterval(decl.sourceInterval(1250, 1273)))
    .define("ruleDescr", [], this.seq(this.prim("(").withInterval(decl.sourceInterval(1315, 1318)), this.app("ruleDescrText").withInterval(decl.sourceInterval(1319, 1332)), this.prim(")").withInterval(decl.sourceInterval(1333, 1336))).withInterval(decl.sourceInterval(1315, 1336)), "a rule description")
    .define("ruleDescrText", [], this.star(this.seq(this.not(this.prim(")").withInterval(decl.sourceInterval(1362, 1365))).withInterval(decl.sourceInterval(1361, 1365)), this.app("any").withInterval(decl.sourceInterval(1366, 1369))).withInterval(decl.sourceInterval(1361, 1369))).withInterval(decl.sourceInterval(1360, 1371)))
    .define("caseName", [], this.seq(this.prim("--").withInterval(decl.sourceInterval(1390, 1394)), this.star(this.seq(this.not(this.prim("\n").withInterval(decl.sourceInterval(1397, 1401))).withInterval(decl.sourceInterval(1396, 1401)), this.app("space").withInterval(decl.sourceInterval(1402, 1407))).withInterval(decl.sourceInterval(1396, 1407))).withInterval(decl.sourceInterval(1395, 1409)), this.app("name").withInterval(decl.sourceInterval(1410, 1414)), this.star(this.seq(this.not(this.prim("\n").withInterval(decl.sourceInterval(1417, 1421))).withInterval(decl.sourceInterval(1416, 1421)), this.app("space").withInterval(decl.sourceInterval(1422, 1427))).withInterval(decl.sourceInterval(1416, 1427))).withInterval(decl.sourceInterval(1415, 1429)), this.alt(this.prim("\n").withInterval(decl.sourceInterval(1431, 1435)), this.la(this.prim("}").withInterval(decl.sourceInterval(1439, 1442))).withInterval(decl.sourceInterval(1438, 1442))).withInterval(decl.sourceInterval(1431, 1442))).withInterval(decl.sourceInterval(1390, 1443)))
    .define("name", [], this.seq(this.app("nameFirst").withInterval(decl.sourceInterval(1468, 1477)), this.star(this.app("nameRest").withInterval(decl.sourceInterval(1478, 1486))).withInterval(decl.sourceInterval(1478, 1487))).withInterval(decl.sourceInterval(1468, 1487)), "a name")
    .define("nameFirst", [], this.alt(this.prim("_").withInterval(decl.sourceInterval(1507, 1510)), this.app("letter").withInterval(decl.sourceInterval(1517, 1523))).withInterval(decl.sourceInterval(1507, 1523)))
    .define("nameRest", [], this.alt(this.prim("_").withInterval(decl.sourceInterval(1542, 1545)), this.app("alnum").withInterval(decl.sourceInterval(1552, 1557))).withInterval(decl.sourceInterval(1542, 1557)))
    .define("ident", [], this.seq(this.not(this.app("keyword").withInterval(decl.sourceInterval(1591, 1598))).withInterval(decl.sourceInterval(1590, 1598)), this.app("name").withInterval(decl.sourceInterval(1599, 1603))).withInterval(decl.sourceInterval(1590, 1603)), "an identifier")
    .define("keyword_null", [], this.seq(this.prim("null").withInterval(decl.sourceInterval(1621, 1627)), this.not(this.app("nameRest").withInterval(decl.sourceInterval(1629, 1637))).withInterval(decl.sourceInterval(1628, 1637))).withInterval(decl.sourceInterval(1621, 1637)))
    .define("keyword_true", [], this.seq(this.prim("true").withInterval(decl.sourceInterval(1654, 1660)), this.not(this.app("nameRest").withInterval(decl.sourceInterval(1662, 1670))).withInterval(decl.sourceInterval(1661, 1670))).withInterval(decl.sourceInterval(1654, 1670)))
    .define("keyword_false", [], this.seq(this.prim("false").withInterval(decl.sourceInterval(1687, 1694)), this.not(this.app("nameRest").withInterval(decl.sourceInterval(1696, 1704))).withInterval(decl.sourceInterval(1695, 1704))).withInterval(decl.sourceInterval(1687, 1704)))
    .define("keyword", [], this.alt(this.app("keyword_null").withInterval(decl.sourceInterval(1621, 1637)), this.app("keyword_true").withInterval(decl.sourceInterval(1654, 1670)), this.app("keyword_false").withInterval(decl.sourceInterval(1687, 1704))).withInterval(decl.sourceInterval(1621, 1714)))
    .define("string", [], this.seq(this.prim("\"").withInterval(decl.sourceInterval(1731, 1735)), this.star(this.app("strChar").withInterval(decl.sourceInterval(1736, 1743))).withInterval(decl.sourceInterval(1736, 1744)), this.prim("\"").withInterval(decl.sourceInterval(1745, 1749))).withInterval(decl.sourceInterval(1731, 1749)))
    .define("strChar", [], this.alt(this.app("escapeChar").withInterval(decl.sourceInterval(1767, 1777)), this.seq(this.not(this.prim("\\").withInterval(decl.sourceInterval(1785, 1789))).withInterval(decl.sourceInterval(1784, 1789)), this.not(this.prim("\"").withInterval(decl.sourceInterval(1791, 1795))).withInterval(decl.sourceInterval(1790, 1795)), this.not(this.prim("\n").withInterval(decl.sourceInterval(1797, 1801))).withInterval(decl.sourceInterval(1796, 1801)), this.app("any").withInterval(decl.sourceInterval(1802, 1805))).withInterval(decl.sourceInterval(1784, 1805))).withInterval(decl.sourceInterval(1767, 1805)))
    .define("escapeChar_backslash", [], this.prim("\\\\").withInterval(decl.sourceInterval(1848, 1854)))
    .define("escapeChar_doubleQuote", [], this.prim("\\\"").withInterval(decl.sourceInterval(1910, 1916)))
    .define("escapeChar_singleQuote", [], this.prim("\\'").withInterval(decl.sourceInterval(1974, 1980)))
    .define("escapeChar_backspace", [], this.prim("\\b").withInterval(decl.sourceInterval(2038, 2043)))
    .define("escapeChar_lineFeed", [], this.prim("\\n").withInterval(decl.sourceInterval(2100, 2105)))
    .define("escapeChar_carriageReturn", [], this.prim("\\r").withInterval(decl.sourceInterval(2161, 2166)))
    .define("escapeChar_tab", [], this.prim("\\t").withInterval(decl.sourceInterval(2228, 2233)))
    .define("escapeChar_unicodeEscape", [], this.seq(this.prim("\\u").withInterval(decl.sourceInterval(2284, 2289)), this.app("hexDigit").withInterval(decl.sourceInterval(2290, 2298)), this.app("hexDigit").withInterval(decl.sourceInterval(2299, 2307)), this.app("hexDigit").withInterval(decl.sourceInterval(2308, 2316)), this.app("hexDigit").withInterval(decl.sourceInterval(2317, 2325))).withInterval(decl.sourceInterval(2284, 2325)))
    .define("escapeChar_hexEscape", [], this.seq(this.prim("\\x").withInterval(decl.sourceInterval(2350, 2355)), this.app("hexDigit").withInterval(decl.sourceInterval(2356, 2364)), this.app("hexDigit").withInterval(decl.sourceInterval(2365, 2373))).withInterval(decl.sourceInterval(2350, 2373)))
    .define("escapeChar", [], this.alt(this.app("escapeChar_backslash").withInterval(decl.sourceInterval(1848, 1854)), this.app("escapeChar_doubleQuote").withInterval(decl.sourceInterval(1910, 1916)), this.app("escapeChar_singleQuote").withInterval(decl.sourceInterval(1974, 1980)), this.app("escapeChar_backspace").withInterval(decl.sourceInterval(2038, 2043)), this.app("escapeChar_lineFeed").withInterval(decl.sourceInterval(2100, 2105)), this.app("escapeChar_carriageReturn").withInterval(decl.sourceInterval(2161, 2166)), this.app("escapeChar_tab").withInterval(decl.sourceInterval(2228, 2233)), this.app("escapeChar_unicodeEscape").withInterval(decl.sourceInterval(2284, 2325)), this.app("escapeChar_hexEscape").withInterval(decl.sourceInterval(2350, 2373))).withInterval(decl.sourceInterval(1848, 2405)), "an escape sequence")
    .define("number", [], this.seq(this.opt(this.prim("-").withInterval(decl.sourceInterval(2434, 2437))).withInterval(decl.sourceInterval(2434, 2438)), this.plus(this.app("digit").withInterval(decl.sourceInterval(2439, 2444))).withInterval(decl.sourceInterval(2439, 2445))).withInterval(decl.sourceInterval(2434, 2445)), "a number")
    .extend("space", [], this.app("comment").withInterval(decl.sourceInterval(2461, 2468)))
    .define("comment_singleLine", [], this.seq(this.prim("//").withInterval(decl.sourceInterval(2486, 2490)), this.star(this.seq(this.not(this.prim("\n").withInterval(decl.sourceInterval(2493, 2497))).withInterval(decl.sourceInterval(2492, 2497)), this.app("any").withInterval(decl.sourceInterval(2498, 2501))).withInterval(decl.sourceInterval(2492, 2501))).withInterval(decl.sourceInterval(2491, 2503)), this.prim("\n").withInterval(decl.sourceInterval(2504, 2508))).withInterval(decl.sourceInterval(2486, 2508)))
    .define("comment_multiLine", [], this.seq(this.prim("/*").withInterval(decl.sourceInterval(2530, 2534)), this.star(this.seq(this.not(this.prim("*/").withInterval(decl.sourceInterval(2537, 2541))).withInterval(decl.sourceInterval(2536, 2541)), this.app("any").withInterval(decl.sourceInterval(2542, 2545))).withInterval(decl.sourceInterval(2536, 2545))).withInterval(decl.sourceInterval(2535, 2547)), this.prim("*/").withInterval(decl.sourceInterval(2548, 2552))).withInterval(decl.sourceInterval(2530, 2552)))
    .define("comment", [], this.alt(this.app("comment_singleLine").withInterval(decl.sourceInterval(2486, 2508)), this.app("comment_multiLine").withInterval(decl.sourceInterval(2530, 2552))).withInterval(decl.sourceInterval(2486, 2566)))
    .define("tokens", [], this.star(this.app("token").withInterval(decl.sourceInterval(2579, 2584))).withInterval(decl.sourceInterval(2579, 2585)))
    .define("token", [], this.alt(this.app("caseName").withInterval(decl.sourceInterval(2597, 2605)), this.app("comment").withInterval(decl.sourceInterval(2608, 2615)), this.app("ident").withInterval(decl.sourceInterval(2618, 2623)), this.app("keyword").withInterval(decl.sourceInterval(2626, 2633)), this.app("number").withInterval(decl.sourceInterval(2636, 2642)), this.app("operator").withInterval(decl.sourceInterval(2645, 2653)), this.app("punctuation").withInterval(decl.sourceInterval(2656, 2667)), this.app("string").withInterval(decl.sourceInterval(2670, 2676)), this.app("any").withInterval(decl.sourceInterval(2679, 2682))).withInterval(decl.sourceInterval(2597, 2682)))
    .define("operator", [], this.alt(this.prim("<:").withInterval(decl.sourceInterval(2697, 2701)), this.prim("=").withInterval(decl.sourceInterval(2704, 2707)), this.prim(":=").withInterval(decl.sourceInterval(2710, 2714)), this.prim("+=").withInterval(decl.sourceInterval(2717, 2721)), this.prim("*").withInterval(decl.sourceInterval(2724, 2727)), this.prim("+").withInterval(decl.sourceInterval(2730, 2733)), this.prim("?").withInterval(decl.sourceInterval(2736, 2739)), this.prim("~").withInterval(decl.sourceInterval(2742, 2745)), this.prim("&").withInterval(decl.sourceInterval(2748, 2751))).withInterval(decl.sourceInterval(2697, 2751)))
    .define("punctuation", [], this.alt(this.prim("<").withInterval(decl.sourceInterval(2769, 2772)), this.prim(">").withInterval(decl.sourceInterval(2775, 2778)), this.prim(",").withInterval(decl.sourceInterval(2781, 2784)), this.prim("--").withInterval(decl.sourceInterval(2787, 2791))).withInterval(decl.sourceInterval(2769, 2791)))
    .build();
});

