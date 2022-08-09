import React, { CSSProperties } from 'react';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import JavascriptIcon from '@mui/icons-material/Javascript';
import FolderIcon from '@mui/icons-material/Folder';
import { blue, red, yellow } from '@mui/material/colors';
import { Folder, Object } from '../fileBrowser';
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
  const ext = name.split('.').pop() || '';
  switch (ext.toLowerCase()) {
    case 'js':
      return <JavascriptIcon {...otherProps} sx={{ color: yellow[700] }} />

    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <ImageIcon {...otherProps} sx={{ color: red[400] }} />

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