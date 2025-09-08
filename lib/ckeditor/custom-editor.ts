// Custom lightweight CKEditor5 build for YustBoard
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Link } from '@ckeditor/ckeditor5-link';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { List } from '@ckeditor/ckeditor5-list';
import { 
  Image, 
  ImageCaption, 
  ImageStyle, 
  ImageToolbar, 
  ImageUpload,
  ImageResize 
} from '@ckeditor/ckeditor5-image';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { 
  FileRepository
} from '@ckeditor/ckeditor5-upload';

class CustomEditor extends ClassicEditor {
  public static override builtinPlugins = [
    Essentials,
    Bold,
    Italic,
    Link,
    Paragraph,
    Heading,
    List,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    ImageResize,
    BlockQuote,
    FileRepository
  ];

  public static override defaultConfig = {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'uploadImage',
        'blockQuote',
        '|',
        'undo',
        'redo'
      ]
    },
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'imageTextAlternative'
      ]
    },
    language: 'en'
  };
}

export default CustomEditor;