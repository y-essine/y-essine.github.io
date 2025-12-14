import React from 'react';

interface ListItemProps {
  text: string;
  highlight?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({ text, highlight = false }) => {
  return (
    <li className={`text-base leading-relaxed ${highlight ? 'text-white' : 'text-[#919191]'}`}>
      {text}
    </li>
  );
};

interface ListProps {
  items: string[];
  highlight?: boolean;
}

export const List: React.FC<ListProps> = ({ items, highlight = false }) => {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <ListItem key={index} text={item} highlight={highlight} />
      ))}
    </ul>
  );
};
