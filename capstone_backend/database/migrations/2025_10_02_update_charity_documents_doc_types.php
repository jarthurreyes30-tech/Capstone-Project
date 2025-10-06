<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change doc_type to string to allow any document type
        DB::statement("ALTER TABLE charity_documents MODIFY COLUMN doc_type VARCHAR(255)");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to enum
        DB::statement("ALTER TABLE charity_documents MODIFY COLUMN doc_type ENUM('registration','tax','bylaws','audit','other')");
    }
};
