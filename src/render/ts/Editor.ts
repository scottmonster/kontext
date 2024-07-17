import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { type EditorConfig } from '@ckeditor/ckeditor5-core';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import { Table, TableCaption, TableCellProperties, TableProperties, TableToolbar } from '@ckeditor/ckeditor5-table';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import { marked } from 'marked';
import TurndownService from 'turndown';


// @ts-ignore
import * as gfmPlugin from 'turndown-plugin-gfm';


class Editor {
  // uses the create method instead so we can await cke creation
  constructor() {} 

  element: HTMLElement;
  cke: ClassicEditor;
  turndownService: TurndownService;
  parser: DOMParser;

  static async create(htmlElement: HTMLElement, options: EditorConfig | object = defaultEditorConfig){

    const cls = new Editor()
    cls.element = htmlElement;
    cls.cke = await ClassicEditor.create(htmlElement, options)

    // This can't be the best way to do this... we don't need it for EACH editor
    //! ƒuck it, just get it going... refactor later if it gets that far
    cls.parser = new DOMParser();
    cls.turndownService = new TurndownService();
    cls.turndownService.use(gfmPlugin.gfm);

    return cls
  }

  doWerk(){

    console.log('doWerk');
    console.log(this);
    console.log(this.element);
    return 'werk'
  }

  async setMD(md: string){
    // const d: string = await marked.parse(md);
    let v = 'sdf'
    this.cke.setData(await marked.parse(md));
  }

  async getMD(): Promise<string> {
    const html = this.cke.getData();
    let tmpDoc = this.parser.parseFromString(html, 'text/html');

    //#region FIX THE MF TABLES

    /**
   * i tried cke markdown plugin but that fails to handle cell alignment correctly
   * it formats the html correctly but :-- , :--: , --: are not converted to markdown
   * it appears that the turndown service expacts to see align=left|center|right on
   * each cell. ckeditor adds style='text-align: center|right' but does nothing for left, 
   * so we need to do it ourselves. we can then setAttribute('align', style.textAlign)
   * so that align=left|center|right is where turndown expects it to be..
   * 
   * we will grab all the table elements, pull the rows and then for each cell
   * - add cell.style.textAlign = 'left' if cell.style.textAlign is not set
   * - cell.setAttribute('align', style.textAlign)
   */

    const tables = tmpDoc.getElementsByTagName('table')
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const tableRows = table.getElementsByTagName('tr');
      for (let r = 0; r < tableRows.length; r++) {
        const row = tableRows[r];
        for (let c = 0; c < row.children.length; c++) {
          const cell = row.children[c] as HTMLElement;

          if (!cell.style.textAlign) {
            cell.style.textAlign = 'left';
          }

          cell.setAttribute('align', cell.style.textAlign);
        }
      }
    }

    //#endregion
    
    //#region FIX THE MF TASK LISTS

    /**
     * Okay up next is the task lists. ckeditor wraps the input element in a
     * label element. the label element has the todo-list__label class. I think
     * we can select them and then set the outerHTML to the innerHTML... 
     * lol that didn't work.
     * instead we will set the parent.innerHTML to the task.innerHTML..
     * mmmmm mucho better-o
     */

    // since we are deleteing dom elements we need to convert the htmlcollection to an array
    let taskLists = Array.from(tmpDoc.getElementsByClassName('todo-list__label'));
    for (let i = 0; i < taskLists.length; i++) {
      const task = taskLists[i];
      const li = task.parentElement;
      const taskInnerHtml =  task.innerHTML;
      li.innerHTML = taskInnerHtml;
    }


  //#endregion


    return this.turndownService.turndown(tmpDoc.body.innerHTML);
  }

}


const defaultEditorConfig = {
  plugins: [
    Autoformat,
    BlockQuote,
    Bold,
    // CloudServices,
    Code,
    CodeBlock,
    Essentials,
    Heading,
    HorizontalLine,
    Image,
    ImageToolbar,
    ImageUpload,
    Base64UploadAdapter,
    Italic,
    Link,
    List,
    // Markdown,
    Mention,
    Paragraph,
    SourceEditing,
    SpecialCharacters,
    // SpecialCharactersEmoji,
    SpecialCharactersEssentials,
    Strikethrough,
    Table,
    TableToolbar,
    TextTransformation,
    TodoList,
    TableCaption,
    TableCellProperties,
    TableProperties
  ],
  language: 'en',
  toolbar: [
    'undo',
    'redo',
    '|',
    'sourceEditing',
    '|',
    'heading',
    '|',
    'bold',
    'italic',
    'strikethrough',
    'code',
    '|',
    'bulletedList',
    'numberedList',
    'todoList',
    '|',
    'link',
    'uploadImage',
    'insertTable',
    'blockQuote',
    'codeBlock',
    'horizontalLine',
    'specialCharacters',
  ],
  codeBlock: {
    languages: [
      { language: 'css', label: 'CSS' },
      { language: 'html', label: 'HTML' },
      { language: 'javascript', label: 'JavaScript' },
      { language: 'php', label: 'PHP' },
    ],
  },
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      {
        model: 'heading1',
        view: 'h1',
        title: 'Heading 1',
        class: 'ck-heading_heading1',
      },
      {
        model: 'heading2',
        view: 'h2',
        title: 'Heading 2',
        class: 'ck-heading_heading2',
      },
      {
        model: 'heading3',
        view: 'h3',
        title: 'Heading 3',
        class: 'ck-heading_heading3',
      },
      {
        model: 'heading4',
        view: 'h4',
        title: 'Heading 4',
        class: 'ck-heading_heading4',
      },
      {
        model: 'heading5',
        view: 'h5',
        title: 'Heading 5',
        class: 'ck-heading_heading5',
      },
      {
        model: 'heading6',
        view: 'h6',
        title: 'Heading 6',
        class: 'ck-heading_heading6',
      },
    ],
  },
  image: {
    toolbar: ['imageTextAlternative'],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'toggleTableCaption', 'TableCellProperties', 'TableProperties' ],
  }
}

export default Editor;
// module.exports = Editor;