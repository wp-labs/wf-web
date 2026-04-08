use std::env;
use std::fs;
use std::io::{self, Read};

use tree_sitter::{Parser, Query, QueryCursor, StreamingIterator};

fn escape_html(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

fn class_name(capture: &str) -> String {
    let mut out = String::from("ts-");
    for ch in capture.chars() {
        match ch {
            '.' => out.push('-'),
            '_' => out.push('-'),
            c if c.is_ascii_alphanumeric() || c == '-' => out.push(c),
            _ => {}
        }
    }
    out
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let input = if let Some(path) = env::args().nth(1) {
        fs::read_to_string(path)?
    } else {
        let mut buf = String::new();
        io::stdin().read_to_string(&mut buf)?;
        buf
    };

    let mut parser = Parser::new();
    parser.set_language(&tree_sitter_wfl::language())?;
    let tree = parser
        .parse(&input, None)
        .ok_or("failed to parse WFL input")?;

    let language = tree_sitter_wfl::language();
    let query = Query::new(&language, tree_sitter_wfl::HIGHLIGHTS_QUERY)?;
    let capture_names = query.capture_names();

    let mut styles: Vec<Option<String>> = vec![None; input.len()];
    let mut cursor = QueryCursor::new();
    let mut captures = cursor.captures(&query, tree.root_node(), input.as_bytes());

    loop {
        captures.advance();
        let Some((m, capture_index)) = captures.get() else {
            break;
        };
        let capture = m.captures[*capture_index];
        let name = &capture_names[capture.index as usize];
        let class = class_name(name);
        let range = capture.node.byte_range();
        for idx in range {
            if idx < styles.len() {
                styles[idx] = Some(class.clone());
            }
        }
    }

    let bytes = input.as_bytes();
    let mut out = String::new();
    let mut i = 0usize;

    while i < bytes.len() {
        let current = styles[i].clone();
        let start = i;
        i += 1;
        while i < bytes.len() && styles[i] == current {
            i += 1;
        }
        let segment = escape_html(std::str::from_utf8(&bytes[start..i])?);
        match current {
            Some(class) => {
                out.push_str("<span class=\"");
                out.push_str(&class);
                out.push_str("\">");
                out.push_str(&segment);
                out.push_str("</span>");
            }
            None => out.push_str(&segment),
        }
    }

    print!("{out}");
    Ok(())
}
