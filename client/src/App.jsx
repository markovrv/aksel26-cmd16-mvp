import { useState, useCallback } from "react";
import { useGameState } from "./context/GameStateContext.jsx";
import Header from "./components/layout/Header.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import RouteScreen from "./screens/RouteScreen.jsx";
import MarketScreen from "./screens/MarketScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import GameModal from "./components/modals/GameModal.jsx";
import TeacherScreen from "./screens/TeacherScreen.jsx";
import RegistrationModal from "./components/modals/RegistrationModal.jsx";
import TeacherLoginModal from "./components/modals/TeacherLoginModal.jsx";
import TestModal from "./components/modals/TestModal.jsx";
import AvatarModal from "./components/modals/AvatarModal.jsx";
import StationPieceModal from "./components/modals/StationPieceModal.jsx";
import TourFormModal from "./components/modals/TourFormModal.jsx";
import FinalResultModal from "./components/modals/FinalResultModal.jsx";
import Toast from "./components/layout/Toast.jsx";

export default function App() {
  const { state, dispatch, companies, isStationUnlocked, stationComplete } = useGameState();
  const [screen, setScreen] = useState("home");
  const [modal, setModal] = useState(null); // { type, props }
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const openModal = useCallback((type, props = {}) => {
    console.log(`[Marshrutka] Opening modal: ${type}`, props);
    setModal({ type, props });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const navigate = useCallback((target) => {
    setScreen(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log(`[Marshrutka] Navigate to: ${target}`);
  }, []);

  const handleStart = useCallback(() => {
    if (!state.profile) {
      openModal("registration");
    } else if (!state.track) {
      openModal("test");
    } else {
      navigate("route");
    }
  }, [state.profile, state.track, openModal, navigate]);

  const afterRegistration = useCallback(() => {
    closeModal();
    showToast("Профиль создан. Теперь определим твой трек.");
    setTimeout(() => openModal("test"), 300);
  }, [closeModal, showToast, openModal]);

  const afterTest = useCallback(() => {
    closeModal();
    showToast("Трек определён. +40 баллов. Создай аватар.");
    setTimeout(() => openModal("avatar"), 300);
  }, [closeModal, showToast, openModal]);

  const afterAvatar = useCallback(() => {
    closeModal();
    showToast("+25 энергии. Первая станция открыта.");
    navigate("route");
  }, [closeModal, showToast, navigate]);

  const openStationPiece = useCallback((companyId, pieceIndex) => {
    const index = companies.findIndex(c => c.id === companyId);
    if (!isStationUnlocked(index)) return;

    // Block 4 with game profession => open 3D game modal
    if (pieceIndex === 3) {
      const company = companies[index];
      if (company.gameProfession) {
        openModal("game", { companyId: company.id, profession: company.gameProfession });
        return;
      }
    }
    openModal("stationPiece", { companyId, pieceIndex });
  }, [companies, isStationUnlocked, openModal, navigate]);

  const openTourForm = useCallback((companyId) => {
    openModal("tourForm", { companyId });
  }, [openModal]);

  const openFinalResult = useCallback(() => {
    openModal("finalResult");
  }, [openModal]);

  return (
    <>
      <Header
        screen={screen}
        navigate={navigate}
        handleStart={handleStart}
        openAvatar={() => state.profile ? openModal("avatar") : openModal("registration")}
        openTeacherLogin={() => openModal("teacherLogin")}
        showToast={showToast}
      />

      {screen === "home" && (
        <HomeScreen
          navigate={navigate}
          handleStart={handleStart}
          companies={companies}
        />
      )}
      {screen === "route" && (
        <RouteScreen
          companies={companies}
          openStationPiece={openStationPiece}
          openModal={openModal}
          openTourForm={openTourForm}
          navigate={navigate}
        />
      )}
      {screen === "market" && (
        <MarketScreen showToast={showToast} />
      )}
      {screen === "profile" && state.role === "teacher" ? (
        <TeacherScreen openModal={openModal} showToast={showToast} />
      ) : (
        screen === "profile" && (
          <ProfileScreen
            openModal={openModal}
            openFinalResult={openFinalResult}
            navigate={navigate}
          />
        )
      )}
      {modal?.type === "teacherLogin" && (
        <TeacherLoginModal
          onClose={closeModal}
          onComplete={() => {
            closeModal();
            navigate("profile");
            showToast("Добро пожаловать в кабинет педагога.");
          }}
        />
      )}

      {modal?.type === "registration" && (
        <RegistrationModal
          onClose={closeModal}
          onComplete={afterRegistration}
        />
      )}
      {modal?.type === "test" && (
        <TestModal
          onClose={closeModal}
          onComplete={afterTest}
        />
      )}
      {modal?.type === "avatar" && (
        <AvatarModal
          onClose={closeModal}
          onComplete={afterAvatar}
        />
      )}
      {modal?.type === "stationPiece" && (
        <StationPieceModal
          companyId={modal.props.companyId}
          pieceIndex={modal.props.pieceIndex}
          onClose={closeModal}
          onTourRequest={openTourForm}
          showToast={showToast}
        />
      )}
      {modal?.type === "tourForm" && (
        <TourFormModal
          companyId={modal.props.companyId}
          onClose={closeModal}
          showToast={showToast}
        />
      )}
      {modal?.type === "game" && (
        <GameModal
          company={companies.find(c => c.id === modal.props.companyId)}
          profession={modal.props.profession}
          onClose={() => {
            closeModal();
            navigate("route");
          }}
          showToast={showToast}
        />
      )}

      {modal?.type === "finalResult" && (
        <FinalResultModal
          onClose={closeModal}
          navigate={navigate}
        />
      )}

      {toast && <Toast message={toast} />}

      <footer>
        <div className="footer-brand">
          <span className="brand-mark"><span className="brand-mouth"></span></span>
          <span><b>МАРШРУТКА</b><small>ДЕМО-КОНЦЕПТ MVP+</small></span>
        </div>
        <p>Промышленный квест для школьников и студентов</p>
        <span>2026 — v2.0</span>
      </footer>
    </>
  );
}