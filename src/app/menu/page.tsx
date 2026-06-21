import MenuPage from "@/components/MenuPage";
import LocationGate from "@/components/LocationGate";

export default function Menu() {
  return (
    <LocationGate>
      <MenuPage />
    </LocationGate>
  );
}
