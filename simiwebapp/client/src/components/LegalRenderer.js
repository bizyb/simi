import React from "react";

const LegalRenderer = props => (
  <div className="legal-container">
    <div className="legal-title"> {props.data.title} </div>
        {props.data.content.map((item, index) => {
            return (
            <div className="legal-row" key={index}>
                {item.heading &&
                <div className="legal-heading">{item.heading}</div> 
                }

                {item.subheading &&
                <div className="legal-subheading">{item.subheading}</div> 
                }

                {item.body &&
                <div className="legal-body"><p>{item.body}</p></div> 
                }
                {item.list && 
                item.isNumbered && <ul id="list-styling">
                    {item.list.map((listItem, listIndex) => {
                        return (
                        <li key={listIndex}>{listItem}</li>
                    )})}
                </ul>}
                {item.list && 
                !item.isNumbered && <ul>
                    {item.list.map((listItem, listIndex) => {
                        return (
                        <li key={listIndex}>{listItem}</li>
                    )})}
                </ul>}
            </div>
        )})}
  </div>
);
export default LegalRenderer;

