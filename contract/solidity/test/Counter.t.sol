// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {Test, console} from "forge-std/Test.sol";
import {GaslessGossip} from "../src/GaslessGossip.sol";
import {MockERC20} from "../src/MockUsdc.sol";

contract GaslessGossipTest is Test {
    GaslessGossip public payments;
    MockERC20 public mockToken;

    address admin = makeAddr("admin");
    address roomCreator = makeAddr("roomCreator");

    string public constant USERNAME1 = "alice";
    string public constant USERNAME2 = "bob";

    address aliceWallet;
    address bobWallet;

    event TipSent(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 platformFee,
        uint256 netAmount,
        string context,
        uint256 timestamp
    );
    event RoomEntryPaid(
        address indexed user,
        uint256 roomId,
        address indexed roomCreator,
        uint256 entryFee,
        uint256 platformFee,
        uint256 creatorAmount,
        uint256 timestamp
    );
    event TokensSent(address indexed sender, address indexed recipient, uint256 amount, uint256 timestamp);
    event FeesWithdrawn(address indexed recipient, uint256 amount, uint256 timestamp);
    event PlatformFeeUpdated(uint16 oldFeeBps, uint16 newFeeBps, uint256 timestamp);
    event PauseStatusChanged(bool paused, uint256 timestamp);
    event UserRegistered(string indexed username, address indexed walletAddress);
    event UsernameUpdated(string oldUsername, string newUsername, address indexed walletAddress);
    event UserWithdrawal(address indexed userWallet, address indexed recipient, address token, uint256 amount, uint256 timestamp);

    uint16 public constant DEFAULT_FEE_BPS = 200; // 2%

    function setUp() public {
        mockToken = new MockERC20(admin);

        payments = new GaslessGossip(admin, DEFAULT_FEE_BPS);

        // Create users (admin is paymaster)
        vm.prank(admin);
        payments.createUser(USERNAME1);
        vm.prank(admin);
        payments.createUser(USERNAME2);

        aliceWallet = payments.getUserOnchainAddress(USERNAME1);
        bobWallet = payments.getUserOnchainAddress(USERNAME2);

        // No global funding—handle per test
        vm.deal(admin, 10 ether);
    }

    /* ---------------------------- USER REGISTRATION ---------------------------- */

    function test_createUser() public {
        string memory newUser = "charlie";

        vm.expectEmit(false, false, false, false);
        emit UserRegistered(newUser, address(0));

        vm.prank(admin);
        address userWallet = payments.createUser(newUser);
        address expectedWallet = payments.getUserOnchainAddress(newUser);

        assertEq(userWallet, expectedWallet);
        assertTrue(payments.isUserRegistered(newUser));
    }

    function test_createUserTwiceReverts() public {
        string memory newUser = "dupTag";  // Fresh username, not in setUp
        vm.prank(admin);
        payments.createUser(newUser);

        vm.expectRevert();
        vm.prank(admin);
        payments.createUser(newUser);
    }

    function test_createUserEmptyUsernameReverts() public {
        vm.expectRevert();
        vm.prank(admin);
        payments.createUser("");
    }

    function test_createUserNonPaymasterReverts() public {
        string memory newUser = "unauth";
        vm.expectRevert();
        vm.prank(aliceWallet);
        payments.createUser(newUser);
    }

    /* ---------------------------- USERNAME UPDATE ---------------------------- */

    function test_updateUsername() public {
        string memory newUser = "alice_new";

        vm.expectEmit(false, false, false, false);
        emit UsernameUpdated(USERNAME1, newUser, payments.getUserOnchainAddress(USERNAME1));

        vm.prank(admin);
        payments.updateUsername(USERNAME1, newUser);

        assertFalse(payments.isUserRegistered(USERNAME1));
        assertTrue(payments.isUserRegistered(newUser));
        assertEq(payments.getUsernameByWallet(payments.getUserOnchainAddress(newUser)), newUser);
        ( , , bool exists) = payments.userProfiles(USERNAME1);
        assertFalse(exists);
    }

    function test_updateUsernameSameNameReverts() public {
        vm.expectRevert();
        vm.prank(admin);
        payments.updateUsername(USERNAME1, USERNAME1);
    }

    function test_updateUsernameNewNameTakenReverts() public {
        string memory newUser = USERNAME2;
        vm.expectRevert();
        vm.prank(admin);
        payments.updateUsername(USERNAME1, newUser);
    }

    function test_updateUsernameOldNameNotExistReverts() public {
        vm.expectRevert();
        vm.prank(admin);
        payments.updateUsername("ghost", "newghost");
    }

    function test_updateUsernameNonPaymasterReverts() public {
        string memory newUser = "unauth_update";
        vm.expectRevert();
        vm.prank(aliceWallet);
        payments.updateUsername(USERNAME1, newUser);
    }

    /* ---------------------------- TIP USER ---------------------------- */

    function test_tipUserETH() public {
        uint256 tipAmount = 1 ether;
        uint256 expectedFee = (tipAmount * DEFAULT_FEE_BPS) / 10000;
        uint256 expectedNet = tipAmount - expectedFee;

        // Fund sender wallet
        vm.deal(aliceWallet, tipAmount);

        vm.expectEmit(false, false, false, false);
        emit TipSent(aliceWallet, bobWallet, tipAmount, expectedFee, expectedNet, "tip", block.timestamp);

        vm.prank(admin);
        payments.tipUser(USERNAME2, tipAmount, address(0), USERNAME1, "tip");

        assertEq(payments.accumulatedFees(), expectedFee);
        assertEq(bobWallet.balance, expectedNet);
        assertEq(aliceWallet.balance, 0);
    }

    function test_tipUserERC20() public {
        uint256 tipAmount = 100 ether;
        uint256 expectedFee = (tipAmount * DEFAULT_FEE_BPS) / 10000;
        uint256 expectedNet = tipAmount - expectedFee;

        // Fund sender wallet
        vm.prank(admin);
        mockToken.mint(aliceWallet, tipAmount);

        vm.expectEmit(false, false, false, false);
        emit TipSent(aliceWallet, bobWallet, tipAmount, expectedFee, expectedNet, "tip", block.timestamp);

        vm.prank(admin);
        payments.tipUser(USERNAME2, tipAmount, address(mockToken), USERNAME1, "tip");

        assertEq(payments.accumulatedTokenFees(address(mockToken)), expectedFee);
        assertEq(mockToken.balanceOf(bobWallet), expectedNet);
        assertEq(mockToken.balanceOf(aliceWallet), 0);
    }

    function test_tipUserSelfTipReverts() public {
        uint256 tipAmount = 1 ether;
        vm.deal(aliceWallet, tipAmount);
        vm.prank(admin);
        vm.expectRevert();
        payments.tipUser(USERNAME1, tipAmount, address(0), USERNAME1, "");
    }

    function test_tipUserZeroAmountReverts() public {
        vm.prank(admin);
        vm.expectRevert();
        payments.tipUser(USERNAME2, 0, address(0), USERNAME1, "");
    }

    function test_tipUserNonPaymasterReverts() public {
        uint256 tipAmount = 1 ether;
        vm.deal(aliceWallet, tipAmount);
        vm.prank(aliceWallet);
        vm.expectRevert();
        payments.tipUser(USERNAME2, tipAmount, address(0), USERNAME1, "");
    }

    function test_tipUserInvalidUsernameReverts() public {
        uint256 tipAmount = 1 ether;
        vm.deal(aliceWallet, tipAmount);
        vm.prank(admin);
        vm.expectRevert();
        payments.tipUser(USERNAME2, tipAmount, address(0), "ghost", "");
    }

    function test_tipUserEmptyUsernameReverts() public {
        uint256 tipAmount = 1 ether;
        vm.deal(aliceWallet, tipAmount);
        vm.prank(admin);
        vm.expectRevert();
        payments.tipUser(USERNAME2, tipAmount, address(0), "", "");
    }

    /* ---------------------------- PAY ROOM ENTRY ---------------------------- */

    function test_payRoomEntryETH() public {
        uint256 roomId = 1;
        uint256 entryFee = 0.5 ether;
        uint256 expectedFee = (entryFee * DEFAULT_FEE_BPS) / 10000;
        uint256 expectedCreatorAmount = entryFee - expectedFee;

        // Fund sender wallet
        vm.deal(aliceWallet, entryFee);

        vm.expectEmit(false, false, false, false);
        emit RoomEntryPaid(aliceWallet, roomId, roomCreator, entryFee, expectedFee, expectedCreatorAmount, block.timestamp);

        vm.prank(admin);
        payments.payRoomEntry(roomId, roomCreator, entryFee, address(0), USERNAME1);

        assertEq(payments.accumulatedFees(), expectedFee);
        assertEq(roomCreator.balance, expectedCreatorAmount);
        assertEq(aliceWallet.balance, 0);
    }

    function test_payRoomEntryERC20() public {
        uint256 roomId = 1;
        uint256 entryFee = 50 ether;
        uint256 expectedFee = (entryFee * DEFAULT_FEE_BPS) / 10000;
        uint256 expectedCreatorAmount = entryFee - expectedFee;

        // Fund sender wallet
        vm.prank(admin);
        mockToken.mint(aliceWallet, entryFee);

        vm.expectEmit(false, false, false, false);
        emit RoomEntryPaid(aliceWallet, roomId, roomCreator, entryFee, expectedFee, expectedCreatorAmount, block.timestamp);

        vm.prank(admin);
        payments.payRoomEntry(roomId, roomCreator, entryFee, address(mockToken), USERNAME1);

        assertEq(payments.accumulatedTokenFees(address(mockToken)), expectedFee);
        assertEq(mockToken.balanceOf(roomCreator), expectedCreatorAmount);
        assertEq(mockToken.balanceOf(aliceWallet), 0);
    }

    function test_payRoomEntryZeroCreatorReverts() public {
        uint256 roomId = 1;
        uint256 entryFee = 0.1 ether;
        vm.deal(aliceWallet, entryFee);
        vm.prank(admin);
        vm.expectRevert();
        payments.payRoomEntry(roomId, address(0), entryFee, address(0), USERNAME1);
    }

    function test_payRoomEntryZeroAmountReverts() public {
        uint256 roomId = 1;
        vm.prank(admin);
        vm.expectRevert();
        payments.payRoomEntry(roomId, roomCreator, 0, address(0), USERNAME1);
    }

    function test_payRoomEntryNonPaymasterReverts() public {
        uint256 roomId = 1;
        uint256 entryFee = 0.1 ether;
        vm.deal(aliceWallet, entryFee);
        vm.prank(aliceWallet);
        vm.expectRevert();
        payments.payRoomEntry(roomId, roomCreator, entryFee, address(0), USERNAME1);
    }

    function test_payRoomEntryInvalidUsernameReverts() public {
        uint256 roomId = 1;
        uint256 entryFee = 0.1 ether;
        vm.deal(aliceWallet, entryFee);
        vm.prank(admin);
        vm.expectRevert();
        payments.payRoomEntry(roomId, roomCreator, entryFee, address(0), "ghost");
    }

    /* ---------------------------- SEND TOKENS ---------------------------- */

    function test_sendTokensETH() public {
        uint256 sendAmount = 0.2 ether;

        // Fund sender wallet
        vm.deal(aliceWallet, sendAmount);

        vm.expectEmit(false, false, false, false);
        emit TokensSent(aliceWallet, bobWallet, sendAmount, block.timestamp);

        vm.prank(admin);
        payments.sendTokens(USERNAME2, sendAmount, address(0), USERNAME1);

        assertEq(bobWallet.balance, sendAmount);
        assertEq(aliceWallet.balance, 0);
    }

    function test_sendTokensERC20() public {
        uint256 sendAmount = 10 ether;

        // Fund sender wallet
        vm.prank(admin);
        mockToken.mint(aliceWallet, sendAmount);

        vm.expectEmit(false, false, false, false);
        emit TokensSent(aliceWallet, bobWallet, sendAmount, block.timestamp);

        vm.prank(admin);
        payments.sendTokens(USERNAME2, sendAmount, address(mockToken), USERNAME1);

        assertEq(mockToken.balanceOf(bobWallet), sendAmount);
        assertEq(mockToken.balanceOf(aliceWallet), 0);
    }

    function test_sendTokensSelfSendReverts() public {
        uint256 sendAmount = 0.1 ether;
        vm.deal(aliceWallet, sendAmount);
        vm.prank(admin);
        vm.expectRevert();
        payments.sendTokens(USERNAME1, sendAmount, address(0), USERNAME1);
    }

    function test_sendTokensZeroAmountReverts() public {
        vm.prank(admin);
        vm.expectRevert();
        payments.sendTokens(USERNAME2, 0, address(0), USERNAME1);
    }

    function test_sendTokensNonPaymasterReverts() public {
        uint256 sendAmount = 0.1 ether;
        vm.deal(aliceWallet, sendAmount);
        vm.prank(aliceWallet);
        vm.expectRevert();
        payments.sendTokens(USERNAME2, sendAmount, address(0), USERNAME1);
    }

    function test_sendTokensInvalidUsernameReverts() public {
        uint256 sendAmount = 0.1 ether;
        vm.deal(aliceWallet, sendAmount);
        vm.prank(admin);
        vm.expectRevert();
        payments.sendTokens(USERNAME2, sendAmount, address(0), "ghost");
    }

    /* ---------------------------- WITHDRAW FROM USER WALLET ---------------------------- */

    function test_withdrawFromUserWalletETH() public {
        address userWallet = payments.getUserOnchainAddress(USERNAME1);
        vm.deal(userWallet, 1 ether);

        uint256 withdrawAmount = 0.3 ether;
        address withdrawTo = makeAddr("withdrawTo");

        vm.expectEmit(false, false, false, false);
        emit UserWithdrawal(userWallet, withdrawTo, address(0), withdrawAmount, block.timestamp);

        vm.prank(admin);
        bool success = payments.withdrawFromUserWallet(address(0), USERNAME1, withdrawTo, withdrawAmount);

        assertTrue(success);
        assertEq(withdrawTo.balance, withdrawAmount);
        assertEq(userWallet.balance, 0.7 ether);
    }

    function test_withdrawFromUserWalletERC20() public {
        address userWallet = payments.getUserOnchainAddress(USERNAME1);
        uint256 depositAmount = 20 ether;
        uint256 withdrawAmount = 5 ether;
        address withdrawTo = makeAddr("withdrawTo");

        vm.prank(admin);
        mockToken.mint(userWallet, depositAmount);

        vm.expectEmit(false, false, false, false);
        emit UserWithdrawal(userWallet, withdrawTo, address(mockToken), withdrawAmount, block.timestamp);

        vm.prank(admin);
        bool success = payments.withdrawFromUserWallet(address(mockToken), USERNAME1, withdrawTo, withdrawAmount);

        assertTrue(success);
        assertEq(mockToken.balanceOf(withdrawTo), withdrawAmount);
        assertEq(mockToken.balanceOf(userWallet), depositAmount - withdrawAmount);
    }

    function test_withdrawFromUserWalletInsufficientBalanceReverts() public {
        // No funding to wallet, so balance=0 <1 ether
        uint256 withdrawAmount = 1 ether;
        address withdrawTo = makeAddr("withdrawTo");

        vm.prank(admin);
        vm.expectRevert();
        payments.withdrawFromUserWallet(address(0), USERNAME1, withdrawTo, withdrawAmount);
    }

    function test_withdrawFromUserWalletEmptyUsernameReverts() public {
        address withdrawTo = makeAddr("withdrawTo");
        uint256 withdrawAmount = 0.1 ether;

        vm.prank(admin);
        vm.expectRevert();
        payments.withdrawFromUserWallet(address(0), "", withdrawTo, withdrawAmount);
    }

    function test_withdrawFromUserWalletNonPaymasterReverts() public {
        address userWallet = payments.getUserOnchainAddress(USERNAME1);
        vm.deal(userWallet, 0.5 ether);
        address withdrawTo = makeAddr("withdrawTo");
        uint256 withdrawAmount = 0.1 ether;

        vm.prank(aliceWallet);
        vm.expectRevert();
        payments.withdrawFromUserWallet(address(0), USERNAME1, withdrawTo, withdrawAmount);
    }

    function test_withdrawFromUserWalletZeroAmountReverts() public {
        address withdrawTo = makeAddr("withdrawTo");

        vm.prank(admin);
        vm.expectRevert();
        payments.withdrawFromUserWallet(address(0), USERNAME1, withdrawTo, 0);
    }

    /* ---------------------------- FEE WITHDRAWAL ---------------------------- */

    function test_withdrawETHFees() public {
        uint256 tipAmount = 1 ether;
        uint256 expectedFee = (tipAmount * DEFAULT_FEE_BPS) / 10000;

        // Fund for tip
        vm.deal(aliceWallet, tipAmount);
        vm.prank(admin);
        payments.tipUser(USERNAME2, tipAmount, address(0), USERNAME1, "");

        vm.expectEmit(false, false, false, false);
        emit FeesWithdrawn(admin, expectedFee, block.timestamp);

        vm.prank(admin);
        payments.withdrawETHFees(payable(admin), expectedFee);

        assertEq(payments.accumulatedFees(), 0);
        assertEq(admin.balance, 10 ether + expectedFee);
    }

    function test_withdrawTokenFees() public {
        uint256 tipAmount = 100 ether;
        uint256 expectedFee = (tipAmount * DEFAULT_FEE_BPS) / 10000;

        // Fund for tip
        vm.prank(admin);
        mockToken.mint(aliceWallet, tipAmount);
        vm.prank(admin);
        payments.tipUser(USERNAME2, tipAmount, address(mockToken), USERNAME1, "");

        vm.prank(admin);
        payments.withdrawTokenFees(address(mockToken), admin, expectedFee);

        assertEq(payments.accumulatedTokenFees(address(mockToken)), 0);
        assertEq(mockToken.balanceOf(admin), expectedFee);
    }

    function test_withdrawETHFeesInsufficientReverts() public {
        vm.prank(admin);
        vm.expectRevert();
        payments.withdrawETHFees(payable(admin), 1 ether);
    }

    function test_withdrawTokenFeesZeroTokenReverts() public {
        vm.prank(admin);
        vm.expectRevert();
        payments.withdrawTokenFees(address(0), admin, 100);
    }

    function test_withdrawETHFeesZeroAmountReverts() public {
        vm.prank(admin);
        vm.expectRevert();
        payments.withdrawETHFees(payable(admin), 0);
    }

    function test_withdrawETHFeesNonOwnerReverts() public {
        vm.deal(address(payments), 1 ether);
        vm.prank(aliceWallet);
        vm.expectRevert();
        payments.withdrawETHFees(payable(aliceWallet), 0.1 ether);
    }

    /* ---------------------------- PLATFORM FEE UPDATE ---------------------------- */

    function test_setPlatformFee() public {
        uint16 newFee = 100; // 1%

        vm.expectEmit(false, false, false, false);
        emit PlatformFeeUpdated(DEFAULT_FEE_BPS, newFee, block.timestamp);

        vm.prank(admin);
        payments.setPlatformFee(newFee);

        assertEq(payments.platformFeeBps(), newFee);
    }

    function test_setPlatformFeeInvalidReverts() public {
        vm.prank(admin);
        vm.expectRevert();
        payments.setPlatformFee(1001); // >10%
    }

    function test_setPlatformFeeNonOwnerReverts() public {
        vm.prank(aliceWallet);
        vm.expectRevert();
        payments.setPlatformFee(100);
    }

    /* ---------------------------- PAUSE/UNPAUSE ---------------------------- */

    function test_pauseAndUnpause() public {
        vm.prank(admin);
        payments.pause();

        assertTrue(payments.paused());

        vm.expectEmit(false, false, false, false);
        emit PauseStatusChanged(false, block.timestamp);

        vm.prank(admin);
        payments.unpause();

        assertFalse(payments.paused());
    }

    function test_pauseNonOwnerReverts() public {
        vm.prank(aliceWallet);
        vm.expectRevert();
        payments.pause();
    }

    function test_pausedRevertsActions() public {
        vm.prank(admin);
        payments.pause();

        uint256 tipAmount = 0.1 ether;
        vm.deal(aliceWallet, tipAmount);
        vm.prank(admin);
        vm.expectRevert();
        payments.tipUser(USERNAME2, tipAmount, address(0), USERNAME1, "");

        vm.prank(admin);
        vm.expectRevert();
        payments.createUser("newuser");
    }

    /* ---------------------------- VIEW FUNCTIONS ---------------------------- */

    function test_getUserOnchainAddress() public {
        address wallet = payments.getUserOnchainAddress(USERNAME1);
        assertNotEq(wallet, address(0));
    }

    function test_getUserOnchainAddressNotExistReverts() public {
        vm.expectRevert();
        payments.getUserOnchainAddress("ghost");
    }

    function test_getUsernameByWallet() public {
        address wallet = payments.getUserOnchainAddress(USERNAME1);
        string memory username = payments.getUsernameByWallet(wallet);
        assertEq(username, USERNAME1);
    }

    function test_getUsernameByWalletInvalidReverts() public {
        vm.expectRevert();
        payments.getUsernameByWallet(makeAddr("invalid"));
    }

    function test_getUserWalletBalanceETH() public {
        address userWallet = payments.getUserOnchainAddress(USERNAME1);
        vm.deal(userWallet, 2 ether);

        uint256 balance = payments.getUserWalletBalance(USERNAME1, address(0));
        assertEq(balance, 2 ether);
    }

    function test_getUserWalletBalanceERC20() public {
        address userWallet = payments.getUserOnchainAddress(USERNAME1);
        uint256 deposit = 15 ether;
        vm.prank(admin);
        mockToken.mint(userWallet, deposit);

        uint256 balance = payments.getUserWalletBalance(USERNAME1, address(mockToken));
        assertEq(balance, deposit);
    }

    function test_getPlatformFee() public {
        assertEq(payments.getPlatformFee(), DEFAULT_FEE_BPS);
    }

    function test_getAccumulatedFees() public {
        assertEq(payments.getAccumulatedFees(), 0);
    }

    /* ---------------------------- EDGE CASES ---------------------------- */

    function test_tipUserEmptyRecipientnameReverts() public {
        uint256 tipAmount = 1 ether;
        vm.deal(aliceWallet, tipAmount);
        vm.prank(admin);
        vm.expectRevert();
        payments.tipUser("", tipAmount, address(0), USERNAME1, "");
    }

    function test_sendTokensEmptyRecipientnameReverts() public {
        uint256 sendAmount = 0.1 ether;
        vm.deal(aliceWallet, sendAmount);
        vm.prank(admin);
        vm.expectRevert();
        payments.sendTokens("", sendAmount, address(0), USERNAME1);
    }
}