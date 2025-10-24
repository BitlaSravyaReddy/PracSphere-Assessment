"use client";

import React from "react";
import "../styles/creativeCards.css";

const CreativeCards: React.FC = () => {
  return (
	<section className="creative-cards style-one">
		<div className="container">
			<div className="row">
				<div className="card-column">
					<div className="card-details">
						<div className="card-icons">
							<img className="light-icon" src="https://i.ibb.co/fV0GzDqj/construction.png" alt="icon" />
						</div>
						<h3>AI Smart Task Creation</h3>
						<p>Describe your task in plain English, and the AI will automatically extract the title, due date, and any subtasks.</p>
						<a className="read-more-btn" href=""><i className="fa-solid fa-angles-right"></i></a>
					</div>
				</div>
				<div className="card-column">
					<div className="card-details">
						<div className="card-icons">
							<img className="light-icon" src="https://i.ibb.co/KjGz3dmZ/skyline.png" alt="icon" />
						</div>
						<h3>AI Smart Insights Generator</h3>
						<p>Analyze your task completion patterns and provides personalized productivity insights and motivational tips..</p>
						<a className="read-more-btn" href=""><i className="fa-solid fa-angles-right"></i></a>
					</div>
				</div>
				<div className="card-column">
					<div className="card-details">
						<div className="card-icons">
							<img className="light-icon" src="https://i.ibb.co/whkhVgQz/best-practice.png" alt="icon" />
						</div>
						<h3>Kanban board</h3>
						<p>Kanban board interface with support for subtasks, drag-and-drop functionality, and real-time progress tracking.</p>
						<a className="read-more-btn" href=""><i className="fa-solid fa-angles-right"></i></a>
					</div>
				</div>
				
			</div>
		</div>
	</section>

  );
};

export default CreativeCards;
