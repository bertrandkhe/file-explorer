import React, { CSSProperties } from 'react';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import JavascriptIcon from '@mui/icons-material/Javascript';
import TerminalIcon from '@mui/icons-material/Terminal';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FolderIcon from '@mui/icons-material/Folder';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import KeyIcon from '@mui/icons-material/Key';
import HtmlIcon from '@mui/icons-material/Html';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import InventoryIcon from '@mui/icons-material/Inventory';
import PhpIcon from '@mui/icons-material/Php';
import CssIcon from '@mui/icons-material/Css';
import HistoryIcon from '@mui/icons-material/History';
import GitHubIcon from '@mui/icons-material/GitHub';
import AbcIcon from '@mui/icons-material/Abc';
import CopyrightIcon from '@mui/icons-material/Copyright';
import { blue, orange, purple, red, yellow } from '@mui/material/colors';
import { Folder, Object } from '../fileBrowser.lib';
import { ViewMode } from './atoms';

const ItemIcon: React.FC<{ 
  item: Folder | Object, 
  className?: string,
  viewMode?: ViewMode,
  style?: CSSProperties,
}> = (props) => {
  const { item, viewMode, ...otherProps } = props;
  const isFolder = item.type === 'folder';
  if (isFolder) {
    return <FolderIcon {...otherProps} sx={{ color: yellow[600] }} />;
  }
  const { name } = item;
  if (/^licen(c|s)e$/.test(name.toLowerCase())) {
    return <CopyrightIcon {...otherProps} sx={{ color: 'black' }} />;
  }
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (ext.endsWith('_history')) {
    return <HistoryIcon {...otherProps} sx={{ color: 'black' }} />;
  }
  if (
    ext.endsWith('rc') 
    || ext.endsWith('config') 
    || ext.endsWith('ignore')
    || name.startsWith('.env')
  ) {
    return <TextSnippetIcon {...otherProps} sx={{ color: 'black' }} />;
  }

  if (ext.startsWith('git')) {
    return <GitHubIcon {...otherProps} sx={{ color: 'black' }} />;
  }

  switch (ext) {
    case 'woff':
    case 'woff2':
    case 'ttf':
    case 'eot':
      return <AbcIcon {...otherProps} sx={{ color: 'black' }} />;

    case 'log':
      return <HistoryIcon {...otherProps} sx={{ color: 'black' }} />;

    case 'sh':
      return <TerminalIcon {...otherProps} sx={{ color: 'black' }} />;

    case 'iml':
    case 'xml':
    case 'yml':
    case 'yaml':
    case 'json':
      return <DataObjectIcon {...otherProps} sx={{ color: 'black' }} />;

    case 'mjs':
    case 'jsx':
    case 'tsx':
    case 'ts':
    case 'js':
      return <JavascriptIcon {...otherProps} sx={{ color: yellow[700] }} />

    case 'template':
    case 'properties':
    case 'lock':
    case 'settings':
    case 'profile':
    case 'vimrc':
    case 'viminfo':
    case 'ini':
    case 'conf':
      return <TextSnippetIcon {...otherProps} sx={{ color: 'black' }} />;

    case 'key':
      return <KeyIcon {...otherProps} sx={{ color: 'black' }} />;

    case 'html':
      return <HtmlIcon {...otherProps} sx={{ color: orange[400] }} />;

    case 'scss':
    case 'sass':
    case 'less':
    case 'css':
      return <CssIcon {...otherProps} sx={{ color: yellow[400] }} />;

    case 'so':
      return <LibraryBooksIcon {...otherProps} sx={{ color: 'black' }} />;

    case 'php':
      return <PhpIcon {...otherProps} sx={{ color: 'black' }} />;

    case 'br':
    case 'tgz':
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
    case 'xz':
      return <InventoryIcon {...otherProps} sx={{ color: purple[600] }} />;

    case 'svg':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <ImageIcon {...otherProps} sx={{ color: red[400] }} />

    
    case 'md':
    case 'txt':
    case 'doc':
    case 'docx':
    case 'pdf':
    case 'odt':
      return <ArticleIcon {...otherProps} />

    default:
      return <InsertDriveFileIcon {...otherProps} sx={{ color: blue[400] }} />;
  }
}

export default ItemIcon;