import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// Payload lexical format bitflags
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_UNDERLINE = 8;

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  tag?: string; // for heading: h1, h2, h3, etc.
  value?: any; // for upload nodes
  fields?: any; // for block nodes
  blockType?: string;
}

interface Props {
  body: any;
}

function renderTextNode(node: LexicalNode, index: number) {
  const text = node.text ?? '';
  const format = node.format ?? 0;

  const isBold = (format & FORMAT_BOLD) !== 0;
  const isItalic = (format & FORMAT_ITALIC) !== 0;
  const isUnderline = (format & FORMAT_UNDERLINE) !== 0;

  return (
    <Text
      key={index}
      style={[
        isBold && styles.bold,
        isItalic && styles.italic,
        isUnderline && styles.underline,
      ]}
    >
      {text}
    </Text>
  );
}

function renderInlineChildren(children: LexicalNode[] = []) {
  return children.map((child, i) => {
    if (child.type === 'text' || child.text !== undefined) {
      return renderTextNode(child, i);
    }
    if (child.type === 'linebreak') {
      return <Text key={i}>{'\n'}</Text>;
    }
    // Recurse for link nodes etc.
    if (child.children) {
      return (
        <Text key={i}>{renderInlineChildren(child.children)}</Text>
      );
    }
    return null;
  });
}

function BlockNode({ node, index }: { node: LexicalNode; index: number }) {
  if (node.type === 'paragraph') {
    const textContent = (node.children ?? [])
      .map((c) => c.text ?? '')
      .join('');
    // Skip completely empty paragraphs
    if (!textContent.trim()) {
      return <View key={index} style={styles.paragraphSpacer} />;
    }
    return (
      <Text key={index} style={styles.paragraph}>
        {renderInlineChildren(node.children)}
      </Text>
    );
  }

  if (node.type === 'heading') {
    const tag = node.tag ?? 'h2';
    const headingStyle =
      tag === 'h1'
        ? styles.h1
        : tag === 'h2'
        ? styles.h2
        : styles.h3;
    return (
      <Text key={index} style={[styles.heading, headingStyle]}>
        {renderInlineChildren(node.children)}
      </Text>
    );
  }

  if (node.type === 'quote') {
    return (
      <View key={index} style={styles.blockquoteContainer}>
        <Text style={styles.blockquoteText}>
          {renderInlineChildren(node.children)}
        </Text>
      </View>
    );
  }

  if (node.type === 'upload') {
    const media = node.value;
    if (!media) return null;
    const imageUrl = media.cloudinaryUrl ?? media.url;
    if (!imageUrl) return null;
    return (
      <Image
        key={index}
        source={{ uri: imageUrl }}
        style={styles.uploadImage}
        resizeMode="cover"
      />
    );
  }

  if (node.type === 'block') {
    const blockType = node.fields?.blockType ?? node.blockType;
    if (blockType === 'carousel') {
      // Gracefully skip carousels — they render inline elsewhere
      return null;
    }
    // Render a visible placeholder for embed blocks and any other unrecognised block type
    return (
      <View key={index} style={styles.embedPlaceholder}>
        <Text style={styles.embedPlaceholderText}>📹 Video content — view on website</Text>
      </View>
    );
  }

  if (node.type === 'list') {
    const isOrdered = node.tag === 'ol';
    return (
      <View key={index} style={styles.list}>
        {(node.children ?? []).map((item, i) => (
          <Text key={i} style={styles.listItem}>
            {isOrdered ? `${i + 1}. ` : '• '}
            {renderInlineChildren(item.children)}
          </Text>
        ))}
      </View>
    );
  }

  // Unknown node type — skip gracefully
  return null;
}

export default function RichTextRenderer({ body }: Props) {
  if (!body?.root?.children) {
    return null;
  }

  const nodes: LexicalNode[] = body.root.children;

  return (
    <View style={styles.container}>
      {nodes.map((node, i) => (
        <BlockNode key={i} node={node} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1a1a1a',
    marginBottom: 14,
  },
  paragraphSpacer: {
    height: 8,
  },
  heading: {
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
    marginTop: 16,
  },
  h1: {
    fontSize: 26,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  blockquoteContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#C8102E',
    paddingLeft: 12,
    marginVertical: 12,
    backgroundColor: '#fdf5f6',
    paddingVertical: 8,
    paddingRight: 8,
    borderRadius: 2,
  },
  blockquoteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    fontStyle: 'italic',
  },
  uploadImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 6,
    marginVertical: 12,
  },
  list: {
    marginBottom: 14,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  embedPlaceholder: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 12,
    alignItems: 'center',
  },
  embedPlaceholderText: {
    fontSize: 14,
    color: '#666',
  },
});
