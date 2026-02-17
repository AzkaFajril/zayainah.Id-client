import Footer from "./Footer";
import Navbar from "./navbar";
import ProductGrid from "./Shop";
import HeroSlider from "./slide";


export default function Routes() {
    return (
        <div>
            <Navbar />
            <HeroSlider />
            <ProductGrid/>
            <Footer />
        </div>
    )
}