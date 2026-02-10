import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isMobileMenuOpen: boolean;
  isCartSheetOpen: boolean;
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  isCartSheetOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.isMobileMenuOpen = action.payload;
    },
    setCartSheetOpen(state, action: PayloadAction<boolean>) {
      state.isCartSheetOpen = action.payload;
    },
    toggleCartSheet(state) {
      state.isCartSheetOpen = !state.isCartSheetOpen;
    },
  },
});

export const { setMobileMenuOpen, setCartSheetOpen, toggleCartSheet } =
  uiSlice.actions;

export default uiSlice.reducer;
