## Available Icons

- AddIcon
- ChangecatalogIcon
- CollapseIcon
- HeadphonesIcon
- NotificationbellIcon
- OrganizationIcon
- PiedashboardIcon
- SearchIcon
- SkyWorldIcon
- TicketsIcon
- UserIcon
- UserlineIcon
- 
UsersIcon

Usage

Import the Icon Component:Import the desired icon component into your React file.
```
import { AddIcon, SearchIcon } from 'path/icons.tsx';


Use in JSX:Render the icon component in your JSX code.
function App() {
  return (
    <div>
      <AddIcon />
      <SearchIcon />
    </div>
  );
}

```

## Text Editor Icons Usage Guide
This repository provides a set of React SVG icon components designed for a rich text editor toolbar. Each icon is a self-contained React functional component.
Installation

Copy the icons.js file into your React project.
Ensure React is installed:npm install react



Available Icons

BoldIcon
ItalicIcon
UnderlineIcon
OverlineIcon
StrikethroughIcon
Heading1Icon
Heading2Icon
Heading3Icon
Heading4Icon
UnorderedListIcon
OrderedListIcon
LinkIcon
ImageIcon
VideoIcon
BlockquoteIcon
CodeBlockIcon
AlignLeftIcon
AlignCenterIcon
AlignRightIcon
SuperscriptIcon
SubscriptIcon

Usage
Import and use the icons in your JSX:
import { BoldIcon, ItalicIcon } from './icons.js';

function Toolbar() {
  return (
    <div>
      <BoldIcon />
      <ItalicIcon />
    </div>
  );
}

Styling
Icons can be styled via CSS or inline styles. They use stroke or fill with default color #495057.
Example:
<BoldIcon style={{ stroke: 'blue', width: '24px', height: '24px' }} />

Notes

Icons are 18x18 by default but scalable.
No external dependencies beyond React.
SVGs are optimized for text editing UI.
