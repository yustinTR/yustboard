// Custom lightweight CKEditor5 build for YustBoard
import {
  ClassicEditor,
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
} from 'ckeditor5';

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