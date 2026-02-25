export const CAKE_QUESTIONS = [
    { id: "occasion", question: "What's the occasion?", type: "select", options: ["Birthday", "Wedding", "Baby Shower", "Naming Ceremony", "Anniversary", "Corporate", "Other (Please specify)"] },
    { id: "serves", question: "How many people are you feeding?", type: "select", options: ["6–8", "10–12", "15–20", "25–30", "40–50", "50+"] },
    { id: "tiers", question: "How many tiers?", type: "select", options: ["1 tier", "2 tiers", "3 tiers"] },
    { id: "flavour", question: "What flavour would you like?", type: "multi-select", options: ["Chocolate", "Vanilla", "Lemon", "Red Velvet", "Marble", "Coconut", "Carrot", "Custom (Please describe)"] },
    { id: "filling", question: "What filling/frosting?", type: "multi-select", options: ["Buttercream", "Cream Cheese", "Ganache", "Fresh Cream", "Fondant", "Custom (Please describe)"] },
    { id: "colours", question: "What colours do you want for the cake?", type: "multi-colour", options: ["Red", "Blue", "Green", "Yellow", "Pink", "Purple", "White", "Black", "Gold", "Silver", "No preference"] },
    { id: "text", question: "Any text on the cake?", type: "text-font", placeholder: "e.g. Happy 30th Birthday Sarah!" },
    { id: "decorations", question: "Any decorations?", type: "multi-select", options: ["Fresh Flowers", "Sugar Flowers", "Sprinkles", "Gold Leaf", "Macarons on top", "Drip Effect", "Fondant Characters", "Candles", "Custom (Please describe)"] },
    { id: "dietary", question: "Any dietary requirements?", type: "multi-select", options: ["Gluten Free", "Dairy Free", "Nut Free", "Vegan", "Halal (Default)", "None"] },
    { id: "date", question: "When do you need it?", type: "date", minDays: 5, tooltip: "We need 5 days notice for custom cakes" },
    { id: "notes", question: "Anything else we should know?", type: "textarea", placeholder: "e.g. specific design inspirations, character themes..." }
];

export const SMALL_CHOPS_QUESTIONS = [
    { id: "serves", question: "How many people?", type: "select", options: ["10–15", "20–30", "40–50", "50–100", "100+"] },
    { id: "items", question: "Which items do you want included?", type: "multi-select", options: ["Puff Puff", "Samosa", "Spring Rolls", "Mini Sausage Rolls", "Peppered Gizzard", "Chicken Sticks", "Fish Rolls", "Scotch Eggs", "Mini Meat Pies", "Chin Chin (as snack)"] },
    { id: "spice", question: "Spice level preference?", type: "select", options: ["Mild", "Medium", "Hot", "Mixed"] },
    { id: "dietary", question: "Any dietary requirements?", type: "multi-select", options: ["Gluten Free", "Dairy Free", "Nut Free", "Vegan", "Halal (Default)", "None"] },
    { id: "date", question: "When do you need it?", type: "date", minDays: 2, tooltip: "We need 48 hours notice for platters" },
    { id: "delivery", question: "Is this for delivery or collection?", type: "select", options: ["Delivery", "Collection"] },
    { id: "notes", question: "Any other notes?", type: "textarea", placeholder: "Special instructions..." }
];

export const PUFF_PUFF_QUESTIONS = [
    { id: "pieces", question: "How many pieces?", type: "select", options: ["12", "24", "36", "48", "72", "Custom number"] },
    { id: "flavour", question: "Flavour?", type: "multi-select", options: ["Classic", "Coconut", "Spiced", "Chocolate Glazed", "Cinnamon Sugar", "Mixed Assortment", "Custom (Please describe)"] },
    { id: "notes", question: "Any special requests?", type: "textarea", placeholder: "Extra dipping sauces? Packaging requests?" }
];

export const OTHER_QUESTIONS = [
    { id: "serves", question: "Approximate serving size / quantity?", type: "select", options: ["Small batch", "Medium batch", "Large event size"] },
    { id: "flavour_profile", question: "Preferred flavour profile?", type: "multi-select", options: ["Sweet", "Savoury", "Mixed", "Surprise me"] },
    { id: "dietary", question: "Dietary requirements?", type: "multi-select", options: ["Gluten Free", "Dairy Free", "Nut Free", "Vegan", "Halal (Default)", "None"] },
    { id: "date", question: "When do you need it?", type: "date", minDays: 3, tooltip: "We typically need 3 days notice" },
    { id: "notes", question: "Detailed description of what you want", type: "textarea", placeholder: "Be as detailed as possible so our AI can design it accurately..." }
];

export const getQuestionsForType = (type: string | null) => {
    switch (type) {
        case "Celebration Cake": return CAKE_QUESTIONS;
        case "Small Chops Platter": return SMALL_CHOPS_QUESTIONS;
        case "Puff Puff": return PUFF_PUFF_QUESTIONS;
        default: return OTHER_QUESTIONS;
    }
};
