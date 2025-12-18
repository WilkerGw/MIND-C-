using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OticaERP.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TotalAmount",
                table: "Sales",
                newName: "TotalValue");

            migrationBuilder.AddColumn<int>(
                name: "AppointmentId",
                table: "ServiceOrders",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "ServiceOrders",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ExamResult",
                table: "ServiceOrders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SaleId",
                table: "ServiceOrders",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SaleId1",
                table: "ServiceOrders",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "ServiceOrders",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProductId",
                table: "Sales",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ServiceOrderId",
                table: "Sales",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductCode",
                table: "Products",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Cpf",
                table: "Clients",
                type: "TEXT",
                maxLength: 14,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_AppointmentId",
                table: "ServiceOrders",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_SaleId1",
                table: "ServiceOrders",
                column: "SaleId1");

            migrationBuilder.CreateIndex(
                name: "IX_Sales_ProductId",
                table: "Sales",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_Products_ProductId",
                table: "Sales",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceOrders_Appointments_AppointmentId",
                table: "ServiceOrders",
                column: "AppointmentId",
                principalTable: "Appointments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceOrders_Sales_SaleId1",
                table: "ServiceOrders",
                column: "SaleId1",
                principalTable: "Sales",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sales_Products_ProductId",
                table: "Sales");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceOrders_Appointments_AppointmentId",
                table: "ServiceOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceOrders_Sales_SaleId1",
                table: "ServiceOrders");

            migrationBuilder.DropIndex(
                name: "IX_ServiceOrders_AppointmentId",
                table: "ServiceOrders");

            migrationBuilder.DropIndex(
                name: "IX_ServiceOrders_SaleId1",
                table: "ServiceOrders");

            migrationBuilder.DropIndex(
                name: "IX_Sales_ProductId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "AppointmentId",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "ExamResult",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "SaleId",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "SaleId1",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "ServiceOrderId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "ProductCode",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Cpf",
                table: "Clients");

            migrationBuilder.RenameColumn(
                name: "TotalValue",
                table: "Sales",
                newName: "TotalAmount");
        }
    }
}
